import type { Metadata } from "next";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { del, put } from "@vercel/blob";
import Link from "next/link";
import { CheckCircle2, CircleAlert, CircleMinus } from "lucide-react";
import Header from "@/components/Header";
import { blobAuth, blobMode, findBlobStoreId, findBlobToken, findDatabaseUrl, googleClientId, googleClientSecret, publicConfig } from "@/lib/config";
import { getDb } from "@/db";

export const metadata: Metadata = { title: "Setup check", robots: { index: false } };
export const dynamic = "force-dynamic";

type Status = "ok" | "missing" | "error" | "optional";
interface Check {
  title: string;
  status: Status;
  detail: React.ReactNode;
}

async function databaseCheck(): Promise<Check> {
  const found = findDatabaseUrl();
  if (!found)
    return {
      title: "Album database (Neon)",
      status: "missing",
      detail: "Not connected. In Vercel, open your project → Storage → Create Storage → Neon, and connect it to the Production environment. Then redeploy.",
    };
  try {
    await getDb().execute(sql`select 1 from "album" limit 1`);
    return { title: "Album database (Neon)", status: "ok", detail: `Connected and ready (setting: ${found.name}).` };
  } catch (e) {
    const msg = (e as Error).message || "";
    if (/does not exist/i.test(msg))
      return {
        title: "Album database (Neon)",
        status: "error",
        detail: "Connected, but the album tables haven't been created yet. Redeploy the site (Deployments → ⋯ → Redeploy). The tables are created during the build.",
      };
    return { title: "Album database (Neon)", status: "error", detail: `Found (setting: ${found.name}) but the site could not connect to it. Check the database is active in Neon, then redeploy.` };
  }
}

async function storageCheck(test: boolean): Promise<Check> {
  const found = findBlobToken() ?? findBlobStoreId();
  if (!found)
    return {
      title: "Photo storage (Blob)",
      status: "missing",
      detail: "Not connected. In Vercel, open your project → Storage → Create Storage → Blob (choose Public access), and connect it to the Production environment. Then redeploy.",
    };
  if (!test)
    return {
      title: "Photo storage (Blob)",
      status: "ok",
      detail: (
        <>
          Connected (setting: {found.name}{blobMode() === "oidc" ? ", automatic sign-in" : ""}).{" "}
          <Link href="/setup?test=1" className="font-semibold text-accent underline">
            Test that photos can be saved
          </Link>
        </>
      ),
    };
  try {
    const blob = await put(`setup-check/test-${Date.now()}.txt`, "ok", { access: "public", ...blobAuth(), addRandomSuffix: true });
    await del(blob.url, blobAuth()).catch(() => undefined);
    return { title: "Photo storage (Blob)", status: "ok", detail: `Connected and working (setting: ${found.name}). A test file was saved and deleted.` };
  } catch (e) {
    const msg = (e as Error).message || "";
    return {
      title: "Photo storage (Blob)",
      status: "error",
      detail: /private|access/i.test(msg)
        ? "Connected, but the storage is set to Private. This site needs Public storage. Create a new Blob store with Public access, connect it, disconnect the old one, then redeploy."
        : "Connected, but a test file could not be saved. Check the Blob store in Vercel's Storage page, then redeploy.",
    };
  }
}

export default async function Setup({ searchParams }: { searchParams: Promise<{ test?: string }> }) {
  const { test } = await searchParams;
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "your-site.vercel.app";
  const proto = h.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;
  const vercelEnv = process.env.VERCEL_ENV;

  const [db, storage] = await Promise.all([databaseCheck(), storageCheck(test === "1")]);
  const gid = googleClientId();
  const gsecret = googleClientSecret();
  const rawId = process.env.AUTH_GOOGLE_ID ?? "";
  let google: Check;
  if (!gid || !gsecret) {
    google = {
      title: "Google sign-in",
      status: process.env.AUTH_RESEND_KEY ? "optional" : "missing",
      detail: `${gid ? "AUTH_GOOGLE_SECRET is missing." : gsecret ? "AUTH_GOOGLE_ID is missing." : "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are not set."} Add them in Vercel → Settings → Environment Variables (Production), then redeploy. Check the names are spelled exactly like this.`,
    };
  } else {
    const problems: string[] = [];
    if (!/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i.test(gid)) {
      if (/^GOCSPX-/i.test(gid)) problems.push("AUTH_GOOGLE_ID contains the Client secret, not the Client ID. Swap the two values.");
      else problems.push("AUTH_GOOGLE_ID doesn't look like a Google Client ID. It should be numbers, a dash, letters, and end with .apps.googleusercontent.com.");
    }
    if (/\.apps\.googleusercontent\.com$/i.test(gsecret)) problems.push("AUTH_GOOGLE_SECRET contains the Client ID. Swap the two values.");
    if (rawId !== gid) problems.push("AUTH_GOOGLE_ID had extra spaces or quotes around it. The site now removes them automatically, but you may want to fix the value in Vercel.");
    google = {
      title: "Google sign-in",
      status: problems.some((p) => !p.startsWith("AUTH_GOOGLE_ID had")) ? "error" : "ok",
      detail: (
        <>
          {problems.length ? problems.join(" ") + " " : "Keys found. "}
          The Client ID in use is <code className="break-all rounded bg-paper px-1">{gid}</code>. It must match the Client ID shown in Google Cloud → Google Auth Platform → Clients, character for character.
        </>
      ),
    };
  }
  const email: Check = process.env.AUTH_RESEND_KEY
    ? { title: "Email sign-in (Resend)", status: "ok", detail: process.env.AUTH_EMAIL_FROM ? `Key found. Emails are sent from ${process.env.AUTH_EMAIL_FROM}.` : "Key found, but AUTH_EMAIL_FROM is not set, so emails can only reach your own Resend account email." }
    : { title: "Email sign-in (Resend)", status: "optional", detail: "Not set up (optional)." };

  const checks = [storage, db, google, email];
  const ready = publicConfig().cloud;

  const icon = (s: Status) =>
    s === "ok" ? <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" aria-label="Done" /> : s === "optional" ? <CircleMinus className="h-6 w-6 shrink-0 text-muted" aria-label="Optional" /> : <CircleAlert className="h-6 w-6 shrink-0 text-red-600" aria-label="Needs attention" />;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Setup check</h1>
        <p className="mt-2 text-muted">This page shows which parts of Keepsake are connected. No passwords or keys are shown.</p>

        <div className={`mt-6 rounded-xl p-4 text-sm ${ready ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>
          {ready ? "Everything needed for sign-in is connected. The Sign in button is shown on the site." : "Sign-in is not available yet. Fix the items marked in red below, then redeploy."}
        </div>

        {vercelEnv && vercelEnv !== "production" && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            You are viewing a <strong>{vercelEnv}</strong> version of the site. Settings saved for Production only don&apos;t apply here. Open your main site address instead.
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {checks.map((c) => (
            <li key={c.title} className="flex gap-3 rounded-xl border border-line bg-white p-4">
              {icon(c.status)}
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="mt-1 text-sm text-muted">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <section className="mt-8 rounded-xl border border-line bg-white p-4">
          <h2 className="font-semibold">Address for Google</h2>
          <p className="mt-1 text-sm text-muted">In Google Cloud → Google Auth Platform → Clients → your client, this must be listed under Authorized redirect URIs exactly:</p>
          <code className="mt-3 block break-all rounded-lg bg-paper p-3 text-sm">{origin}/api/auth/callback/google</code>
        </section>

        <p className="mt-8 text-sm text-muted">After changing anything in Vercel, redeploy (Deployments → ⋯ → Redeploy), wait for it to finish, then reload this page.</p>
      </main>
    </>
  );
}
