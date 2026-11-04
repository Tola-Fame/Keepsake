import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import { currentUser } from "@/auth";
import { cloudEnabled } from "@/lib/config";
import AdminNav from "./AdminNav";

export const metadata: Metadata = { title: { default: "Team dashboard", template: "%s · Team · Keepsake" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!cloudEnabled()) redirect("/");
  const user = await currentUser();
  if (!user) redirect("/signin?next=/admin");
  return (
    <>
      <Header />
      {user.isAdmin ? (
        <div className="mx-auto max-w-6xl px-4 py-8">
          <AdminNav />
          {children}
        </div>
      ) : (
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-accent" aria-hidden />
          <h1 className="mt-3 font-display text-2xl font-bold">This page is for the Keepsake team</h1>
          <p className="mt-2 text-muted">
            You&apos;re signed in as {user.email}. To get access, ask whoever manages the site to add your email to ADMIN_EMAILS in the Vercel project settings.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Go home
          </Link>
        </main>
      )}
    </>
  );
}
