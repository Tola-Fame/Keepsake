import Link from "next/link";
import { Download, LayoutTemplate, Printer, Share2, Upload, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemplateShowcase from "@/components/TemplateShowcase";

const steps = [
  { icon: Upload, title: "Add your photos", text: "Drop in pictures from your phone or computer." },
  { icon: LayoutTemplate, title: "Pick a template", text: "Start from a design made for the occasion, or a blank page." },
  { icon: Download, title: "Download or print", text: "Get a print-ready PDF, page images, or print straight from your browser." },
];

const features = [
  { icon: LayoutTemplate, title: "Templates for every occasion", text: "Birthdays, weddings, vacations, babies, graduations, anniversaries, family and holidays." },
  { icon: Upload, title: "Drag-and-drop editor", text: "Arrange photos, crop, rotate, add captions, stickers, backgrounds and filters." },
  { icon: Printer, title: "Print-ready at 300 DPI", text: "Square, Letter and A4 sizes. Take the PDF to any print shop or print at home." },
  { icon: Share2, title: "Share with a link", text: "Send your album to family and friends. They can view it on any device." },
  { icon: Users, title: "Collect guest photos", text: "Let wedding and party guests add their own pictures to your album." },
  { icon: Download, title: "No account needed to start", text: "Make an album right away. Sign in later to save it online." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:pt-20">
          <div>
            <p className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-dark">Photo albums, made simple</p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">Turn your photos into albums worth keeping.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Design a beautiful album for a birthday, wedding, vacation or any moment, then download it or print it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/new" className="btn-primary px-6 py-3 text-base">
                Start an album
              </Link>
              <Link href="/trip" className="btn-secondary px-6 py-3 text-base">
                Make a travel book
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">Free to use. No account needed to start.</p>
          </div>
          <TemplateShowcase variant="hero" />
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-lg font-bold text-accent-dark">{i + 1}</div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-16" aria-labelledby="travel-title">
          <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-[#fbeee6] p-8 sm:p-12 md:grid-cols-2">
            <div>
              <p className="mb-3 inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-dark">New · Travel books</p>
              <h2 id="travel-title" className="font-display text-3xl font-bold sm:text-4xl">
                Every trip, its own book.
              </h2>
              <p className="mt-3 max-w-md text-muted">
                Drop in your trip photos and we sort them into days and lay out every page. Pick a pastel cover, then keep your books together on your own bookshelf.
              </p>
              <Link href="/trip" className="btn-primary mt-6 px-6 py-3 text-base">
                Make a travel book
              </Link>
            </div>
            <TemplateShowcase variant="travel" />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pt-16 text-center" aria-labelledby="demo-title">
          <h2 id="demo-title" className="font-display text-3xl font-bold sm:text-4xl">
            See how it works
          </h2>
          <p className="mt-2 text-muted">A two-minute tour, from choosing a template to downloading your album.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
            <video
              className="block aspect-video w-full bg-paper"
              controls
              playsInline
              preload="none"
              poster="/demo/keepsake-demo-poster.jpg"
              aria-label="Demo video: how to make a photo album with Keepsake"
            >
              <source src="/demo/keepsake-demo.mp4" type="video/mp4" />
              Your browser can&apos;t play this video.{" "}
              <a href="/demo/keepsake-demo.mp4" className="font-semibold text-accent underline">
                Download it instead
              </a>
              .
            </video>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Templates for every occasion</h2>
          <p className="mt-2 text-muted">Every template can be changed: colors, fonts, layouts and stickers.</p>
          <div className="mt-8">
            <TemplateShowcase variant="grid" />
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-line bg-paper p-6">
                  <f.icon className="h-6 w-6 text-accent" aria-hidden />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to make something to keep?</h2>
          <Link href="/new" className="btn-primary mt-8 px-8 py-3 text-base">
            Start your album
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
