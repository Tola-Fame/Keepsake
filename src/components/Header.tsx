"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, Plane, X } from "lucide-react";
import { useApp } from "./AppProvider";
import { signOutAction } from "@/app/actions";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark.svg" alt="" width={30} height={36} className="h-9 w-[30px]" />
      Keepsake
    </Link>
  );
}

export default function Header() {
  const { config, user } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  const links = [
    { href: "/trip", label: "Travel books" },
    { href: "/new", label: "Templates" },
    { href: "/albums", label: "Bookshelf" },
    ...(user ? [{ href: "/orders", label: "My orders" }] : []),
    ...(user?.isAdmin ? [{ href: "/admin", label: "Team" }] : []),
    { href: "/faq", label: "Help" },
  ];
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`rounded-full px-3 py-2 text-sm font-bold transition ${isActive(l.href) ? "bg-accent-soft text-accent-dark" : "hover:bg-black/5"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/trip" className="btn-primary px-4">
            <Plane className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Make a book</span>
            <span className="sm:hidden">Make</span>
          </Link>
          {config.cloud &&
            (user ? (
              <div className="relative hidden md:block">
                <button onClick={() => setOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-accent-soft text-sm font-bold" aria-label="Account menu" aria-expanded={open}>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (user.name || user.email || "?")[0].toUpperCase()
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-lg" onMouseLeave={() => setOpen(false)}>
                    <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
                    <Link href="/albums" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
                      My bookshelf
                    </Link>
                    <Link href="/orders" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
                      My orders
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
                        Team dashboard
                      </Link>
                    )}
                    <form action={signOutAction}>
                      <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-paper">
                        <LogOut className="h-4 w-4" aria-hidden /> Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="btn-secondary hidden px-4 md:inline-flex">
                Sign in
              </Link>
            ))}
          <button className="btn-ghost p-2 md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu" aria-expanded={mobile}>
            {mobile ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav className="border-t border-line bg-paper px-4 py-3 md:hidden" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`block rounded-xl px-3 py-2.5 font-bold ${isActive(l.href) ? "bg-accent-soft text-accent-dark" : ""}`} onClick={() => setMobile(false)}>
              {l.label}
            </Link>
          ))}
          {config.cloud &&
            (user ? (
              <form action={signOutAction}>
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-bold text-muted">
                  <LogOut className="h-4 w-4" aria-hidden /> Sign out ({user.email})
                </button>
              </form>
            ) : (
              <Link href="/signin" className="block rounded-xl px-3 py-2.5 font-bold text-accent" onClick={() => setMobile(false)}>
                Sign in
              </Link>
            ))}
        </nav>
      )}
    </header>
  );
}
