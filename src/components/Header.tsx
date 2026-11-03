"use client";

import Link from "next/link";
import { useState } from "react";
import { BookHeart, LogOut, Plus } from "lucide-react";
import { useApp } from "./AppProvider";
import { signOutAction } from "@/app/actions";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-bold tracking-tight ${className}`}>
      <BookHeart className="h-6 w-6 text-accent" aria-hidden />
      Keepsake
    </Link>
  );
}

export default function Header() {
  const { config, user } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/albums" className="btn-ghost hidden sm:inline-flex">
            My albums
          </Link>
          <Link href="/new" className="btn-primary px-4">
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">New album</span>
            <span className="sm:hidden">New</span>
          </Link>
          {config.cloud &&
            (user ? (
              <div className="relative">
                <button onClick={() => setOpen((o) => !o)} className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-accent-soft text-sm font-semibold" aria-label="Account menu">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (user.name || user.email || "?")[0].toUpperCase()
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-2 shadow-lg" onMouseLeave={() => setOpen(false)}>
                    <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
                    <Link href="/albums" className="block rounded-lg px-3 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
                      My albums
                    </Link>
                    <form action={signOutAction}>
                      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-paper">
                        <LogOut className="h-4 w-4" aria-hidden /> Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="btn-secondary px-4">
                Sign in
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
