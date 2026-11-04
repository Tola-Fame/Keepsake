// Server-side feature detection based on which environment variables are set.

import { createHash } from "node:crypto";

/**
 * Finds the database address. Vercel's database integrations use different names
 * (DATABASE_URL, POSTGRES_URL, or a custom prefix like STORAGE_DATABASE_URL).
 */
export function findDatabaseUrl(): { name: string; value: string } | null {
  const env = process.env;
  for (const name of ["DATABASE_URL", "POSTGRES_URL"]) if (env[name]) return { name, value: env[name]! };
  for (const [name, value] of Object.entries(env)) {
    if (value && /(_DATABASE_URL|_POSTGRES_URL)$/.test(name) && /^postgres(ql)?:\/\//.test(value)) return { name, value };
  }
  return null;
}

/** Finds the Vercel Blob token, even when the store was connected with a custom prefix. */
export function findBlobToken(): { name: string; value: string } | null {
  const env = process.env;
  if (env.BLOB_READ_WRITE_TOKEN) return { name: "BLOB_READ_WRITE_TOKEN", value: env.BLOB_READ_WRITE_TOKEN };
  for (const [name, value] of Object.entries(env)) {
    if (value && value.startsWith("vercel_blob_rw_")) return { name, value };
  }
  return null;
}

/**
 * Newer Vercel Blob stores are connected without a token: Vercel adds BLOB_STORE_ID and
 * the site signs in to storage automatically (OIDC). A custom prefix gives e.g. PHOTOS_STORE_ID.
 */
export function findBlobStoreId(): { name: string; value: string } | null {
  const env = process.env;
  if (env.BLOB_STORE_ID) return { name: "BLOB_STORE_ID", value: env.BLOB_STORE_ID };
  for (const [name, value] of Object.entries(env)) {
    if (value && /_STORE_ID$/.test(name) && /^store_/i.test(value)) return { name, value };
  }
  return null;
}

export const databaseUrl = () => findDatabaseUrl()?.value;
export const blobToken = () => findBlobToken()?.value;

/** "token" = classic read-write token; "oidc" = store id + automatic Vercel sign-in. */
export function blobMode(): "token" | "oidc" | null {
  if (blobToken()) return "token";
  if (findBlobStoreId()) return "oidc";
  return null;
}

/** Credentials to pass to every @vercel/blob server call. */
export function blobAuth(): { token?: string; storeId?: string } {
  const token = blobToken();
  if (token) return { token };
  const storeId = findBlobStoreId()?.value;
  return storeId ? { storeId } : {};
}

export function cloudEnabled() {
  return Boolean(databaseUrl() && blobMode());
}

/**
 * Secret used to protect sign-in sessions. Uses AUTH_SECRET when set; otherwise it is
 * derived from the (already secret) database and storage keys so no extra setup is needed.
 */
export function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!cloudEnabled()) return undefined;
  return createHash("sha256").update(`keepsake-auth|${databaseUrl()}|${blobToken() ?? findBlobStoreId()?.value}`).digest("base64url");
}

export function googleEnabled() {
  return cloudEnabled() && Boolean(googleClientId() && googleClientSecret());
}

export function emailEnabled() {
  return cloudEnabled() && Boolean(process.env.AUTH_RESEND_KEY);
}

export interface PublicConfig {
  cloud: boolean;
  google: boolean;
  email: boolean;
  blobMode: "token" | "oidc" | null;
  /** Google OAuth client id, when the Google Photos button is turned on. */
  googlePhotosClientId: string | null;
}

export function publicConfig(): PublicConfig {
  return {
    cloud: cloudEnabled() && (googleEnabled() || emailEnabled()),
    google: googleEnabled(),
    email: emailEnabled(),
    blobMode: blobMode(),
    googlePhotosClientId: googlePhotosEnabled() ? googleClientId() : null,
  };
}

/** The Google Photos button needs the Google sign-in key plus GOOGLE_PHOTOS=on (see SETUP-GUIDE.md). */
export function googlePhotosEnabled() {
  return /^(on|true|1|yes)$/i.test(clean(process.env.GOOGLE_PHOTOS)) && Boolean(googleClientId());
}

/** Team members who can manage print orders and vendors (ADMIN_EMAILS, comma-separated). */
export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const admins = clean(process.env.ADMIN_EMAILS)
    .split(/[,\s]+/)
    .map((e) => e.toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

/** Google keys with stray spaces, quotes and line breaks from copy-paste removed. */
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^["']|["']$/g, "").trim();
export const googleClientId = () => clean(process.env.AUTH_GOOGLE_ID);
export const googleClientSecret = () => clean(process.env.AUTH_GOOGLE_SECRET);
