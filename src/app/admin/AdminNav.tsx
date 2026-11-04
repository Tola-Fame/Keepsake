"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, Package } from "lucide-react";

const LINKS = [
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/vendors", label: "Vendors", icon: Factory },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mb-8 flex items-center gap-2 border-b border-line pb-4" aria-label="Team dashboard">
      <span className="mr-2 text-xs font-bold uppercase tracking-wider text-muted">Team</span>
      {LINKS.map((l) => {
        const active = path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-ink text-white" : "hover:bg-black/5"}`}>
            <l.icon className="h-4 w-4" aria-hidden /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
