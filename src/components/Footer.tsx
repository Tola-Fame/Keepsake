import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <Logo className="text-base text-ink" />
        <p>Make, download and print photo albums.</p>
      </div>
    </footer>
  );
}
