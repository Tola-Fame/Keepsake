import Link from "next/link";
import { Logo } from "./Header";

const COLUMNS = [
  {
    title: "Make",
    links: [
      { href: "/trip", label: "Travel books" },
      { href: "/new", label: "All templates" },
      { href: "/albums", label: "My bookshelf" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "Help & FAQ" },
      { href: "/orders", label: "Track an order" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-white" />
          <p className="mt-3 max-w-xs text-sm text-white/60">Your trips and moments, printed as books you&apos;ll keep on the shelf.</p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/80 hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
