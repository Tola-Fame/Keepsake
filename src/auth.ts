import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authSecret, cloudEnabled, emailEnabled, googleClientId, googleClientSecret, googleEnabled } from "@/lib/config";
import { getDb, schema } from "@/db";

export const { handlers, auth: rawAuth, signIn, signOut } = NextAuth((): NextAuthConfig => {
  const providers: NextAuthConfig["providers"] = [];
  if (googleEnabled()) providers.push(Google({ clientId: googleClientId(), clientSecret: googleClientSecret(), allowDangerousEmailAccountLinking: true }));
  if (emailEnabled())
    providers.push(
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.AUTH_EMAIL_FROM || "Keepsake <onboarding@resend.dev>",
      }),
    );

  return {
    trustHost: true,
    secret: authSecret(),
    adapter: cloudEnabled()
      ? DrizzleAdapter(getDb(), {
          usersTable: schema.users,
          accountsTable: schema.accounts,
          sessionsTable: schema.sessions,
          verificationTokensTable: schema.verificationTokens,
        })
      : undefined,
    session: { strategy: "database" },
    providers,
    pages: { signIn: "/signin", verifyRequest: "/signin?sent=1", error: "/signin" },
    callbacks: {
      session({ session, user }) {
        if (session.user && user) session.user.id = user.id;
        return session;
      },
    },
  };
});

/** Returns the signed-in user, or null (also when cloud features are not configured). */
export async function currentUser() {
  if (!cloudEnabled()) return null;
  try {
    const session = await rawAuth();
    return session?.user?.id ? { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null } : null;
  } catch {
    return null;
  }
}
