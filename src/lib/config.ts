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

export const databaseUrl = () => findDatabaseUrl()?.value;
export const blobToken = () => findBlobToken()?.value;

export function cloudEnabled() {
  return Boolean(databaseUrl() && blobToken());
}

/**
 * Secret used to protect sign-in sessions. Uses AUTH_SECRET when set; otherwise it is
 * derived from the (already secret) database and storage keys so no extra setup is needed.
 */
export function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!cloudEnabled()) return undefined;
  return createHash("sha256").update(`keepsake-auth|${databaseUrl()}|${blobToken()}`).digest("base64url");
}

export function googleEnabled() {
  return cloudEnabled() && Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export function emailEnabled() {
  return cloudEnabled() && Boolean(process.env.AUTH_RESEND_KEY);
}

export interface PublicConfig {
  cloud: boolean;
  google: boolean;
  email: boolean;
}

export function publicConfig(): PublicConfig {
  return { cloud: cloudEnabled() && (googleEnabled() || emailEnabled()), google: googleEnabled(), email: emailEnabled() };
}
