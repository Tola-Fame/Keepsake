import Header from "./Header";
import Footer from "./Footer";

export const LEGAL_UPDATED = "November 4, 2026";

/** Contact line for legal pages. Set CONTACT_EMAIL in Vercel to show an email address. */
export function Contact() {
  const email = process.env.CONTACT_EMAIL;
  return email ? (
    <a href={`mailto:${email}`} className="font-semibold text-accent hover:underline">
      {email}
    </a>
  ) : (
    <span>the site owner</span>
  );
}

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LEGAL_UPDATED}</p>
        <div className="mt-8 space-y-4 leading-relaxed text-ink/90 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">{children}</div>
      </main>
      <Footer />
    </>
  );
}
