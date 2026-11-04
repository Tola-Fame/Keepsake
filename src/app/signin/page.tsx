import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import Header from "@/components/Header";
import { currentUser } from "@/auth";
import { publicConfig } from "@/lib/config";
import { signInWithEmail, signInWithGoogle } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const errorText: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already linked to another sign-in method. Please use that method.",
  Verification: "That sign-in link has expired or was already used. Please request a new one.",
  Configuration: "Sign-in is not set up correctly yet. Please check the setup guide.",
};

export default async function SignIn({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const config = publicConfig();
  const next = sp.next || sp.callbackUrl || "/albums";
  if (await currentUser()) redirect(next.startsWith("/") ? next : "/albums");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12 sm:py-20">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          {sp.sent ? (
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-accent" aria-hidden />
              <h1 className="mt-4 font-display text-2xl font-bold">Check your email</h1>
              <p className="mt-2 text-muted">We sent you a sign-in link. Open it on this device to continue. The link expires in 24 hours.</p>
            </div>
          ) : !config.cloud ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold">Accounts are not turned on</h1>
              <p className="mt-2 text-muted">You can still make albums. They are saved in this browser.</p>
              <Link href="/new" className="btn-primary mt-6">
                Start an album
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Sign in to Keepsake</h1>
              <p className="mt-2 text-sm text-muted">Save albums online, open them on any device, and share them with family and friends.</p>
              {sp.error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorText[sp.error] ?? "Sign-in failed. Please try again."}</p>}
              <div className="mt-6 space-y-4">
                {config.google && (
                  <form action={signInWithGoogle}>
                    <input type="hidden" name="next" value={next} />
                    <button className="btn-secondary w-full py-3">
                      <GoogleIcon /> Continue with Google
                    </button>
                  </form>
                )}
                {config.google && config.email && (
                  <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
                    <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
                  </div>
                )}
                {config.email && (
                  <form action={signInWithEmail} className="space-y-3">
                    <input type="hidden" name="next" value={next} />
                    <label className="label" htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input py-3" />
                    <button className="btn-primary w-full py-3">
                      <Mail className="h-4 w-4" aria-hidden /> Email me a sign-in link
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-6 text-center text-xs text-muted">
                No password needed. By signing in you agree to the{" "}
                <Link href="/terms" className="underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  privacy policy
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
