import Link from "next/link";
import { BookOpen, Images, LayoutTemplate, Package, Share2, Sparkles, Truck, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemplateShowcase from "@/components/TemplateShowcase";

const steps = [
  { icon: Images, title: "Add your photos", text: "From your phone, your computer or Google Photos.", bg: "bg-peach" },
  { icon: Sparkles, title: "We lay it out", text: "Photos are sorted by day and placed on pages for you. Change anything you like.", bg: "bg-mint" },
  { icon: Truck, title: "We print and ship", text: "Order a printed copy and we deliver it to your door.", bg: "bg-lilac" },
];

const features = [
  { icon: Sparkles, title: "Laid out for you", text: "Drop in a trip's photos and get a finished book, day by day." },
  { icon: BookOpen, title: "Pastel covers", text: "Six travel covers, plus templates for birthdays, weddings, babies and more." },
  { icon: Package, title: "Printed and shipped", text: "Quality printing and binding, delivered to your door. Track every order." },
  { icon: LayoutTemplate, title: "Easy editor", text: "Drag photos, change layouts, add captions, stickers and backgrounds." },
  { icon: Share2, title: "Share with a link", text: "Send your book to family and friends to view on any device." },
  { icon: Users, title: "Collect guest photos", text: "Let fellow travellers and guests add their own pictures." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
          <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-charcoal px-6 py-10 text-white sm:px-12 sm:py-14 md:grid-cols-[1fr_1.1fr]">
            <div className="relative order-2 md:order-1">
              <TemplateShowcase variant="hero" />
              <span className="absolute -right-1 top-1/3 flex h-20 w-20 rotate-12 items-center justify-center rounded-full border-4 border-white bg-accent text-center text-xs font-extrabold leading-tight shadow-lg sm:h-24 sm:w-24 sm:text-sm">
                Printed
                <br />& shipped
              </span>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm font-bold text-white/70">Travel photo books</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">Your trips, turned into books you&apos;ll keep.</h1>
              <p className="mt-5 max-w-lg text-lg text-white/75">Drop in your photos and we lay out every day of your trip. Pick a pastel cover, then we print it and ship it to your door.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/trip" className="btn-primary px-6 py-3 text-base">
                  Make a travel book
                </Link>
                <Link href="/new" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10">
                  Browse templates
                </Link>
              </div>
              <p className="mt-4 text-sm text-white/60">Free to design. No account needed to start.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="how-title">
          <h2 id="how-title" className="text-center font-display text-3xl font-extrabold sm:text-4xl">
            From camera roll to bookshelf
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className={`rounded-3xl p-7 ${s.bg}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-display text-lg font-extrabold">{i + 1}</span>
                  <s.icon className="h-6 w-6 text-ink/70" aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-xl font-extrabold">{s.title}</h3>
                <p className="mt-1 text-ink/75">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4" aria-labelledby="shelf-title">
          <div className="grid items-center gap-10 rounded-[2rem] bg-white p-8 ring-1 ring-line sm:p-12 md:grid-cols-2">
            <div>
              <h2 id="shelf-title" className="font-display text-3xl font-extrabold sm:text-4xl">
                Every trip, its own book.
              </h2>
              <p className="mt-3 max-w-md text-muted">Each book gets a soft pastel cover and a place on your own bookshelf. Open any of them to edit, share or order another copy.</p>
              <Link href="/trip" className="btn-dark mt-6 px-6 py-3 text-base">
                Start your first book
              </Link>
            </div>
            <div>
              <TemplateShowcase variant="travel" />
              <div className="h-3 rounded-sm bg-gradient-to-b from-[#e9dcc8] to-[#d8c6ab] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.25)]" aria-hidden />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pt-16 text-center" aria-labelledby="demo-title">
          <h2 id="demo-title" className="font-display text-3xl font-extrabold sm:text-4xl">
            See how it works
          </h2>
          <p className="mt-2 text-muted">A two-minute tour, from choosing a design to downloading your book.</p>
          <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white shadow-xl">
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
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Not just for trips</h2>
          <p className="mt-2 text-muted">Templates for birthdays, weddings, babies, graduations and more. Every one can be changed.</p>
          <div className="mt-8">
            <TemplateShowcase variant="grid" />
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Everything you need</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-3xl border border-line bg-paper p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                    <f.icon className="h-5 w-5 text-accent" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-extrabold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-[2rem] bg-rose px-6 py-14 text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Where did you go this year?</h2>
            <p className="mx-auto mt-3 max-w-md text-ink/75">Turn it into a book in a few minutes.</p>
            <Link href="/trip" className="btn-primary mt-8 px-8 py-3 text-base">
              Make a travel book
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
