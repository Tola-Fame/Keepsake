// Server-side feature detection based on which environment variables are set.

import { createHash } from "node:crypto";

export function cloudEnabled() {
  return Boolean(process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Secret used to protect sign-in sessions. Uses AUTH_SECRET when set; otherwise it is
 * derived from the (already secret) database and storage keys so no extra setup is needed.
 */
export function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!cloudEnabled()) return undefined;
  return createHash("sha256").update(`keepsake-auth|${process.env.DATABASE_URL}|${process.env.BLOB_READ_WRITE_TOKEN}`).digest("base64url");
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
