import Link from "next/link";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <Logo className="text-base text-ink" />
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-ink hover:underline">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-ink hover:underline">
            Terms of service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
