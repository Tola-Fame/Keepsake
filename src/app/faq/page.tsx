import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Answers about making, printing, downloading and sharing photo albums with Keepsake.",
};

type QA = { q: string; a: React.ReactNode };

const sections: { title: string; items: QA[] }[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "Do I need an account?",
        a: "No. You can make, download and print albums without signing in. Signing in lets you save albums online, open them on any device, and share them.",
      },
      {
        q: "Where are my albums saved?",
        a: (
          <>
            <p>Albums made without signing in are saved only in the browser on the device you used. Clearing your browser data deletes them, and they don&apos;t appear on other devices.</p>
            <p>Albums made while signed in are saved to your account.</p>
          </>
        ),
      },
      {
        q: "How do I move an album into my account?",
        a: "Sign in, open My albums, and click the cloud button on the album under “On this device”. Its photos are uploaded and the album then opens from your account.",
      },
    ],
  },
  {
    title: "Photos & editing",
    items: [
      {
        q: "Can I add photos from Google Photos or Apple Photos?",
        a: "Yes. On a phone, tap Choose photos: iPhones open your Photos library (including iCloud) and Android phones open your gallery, including Google Photos. On a computer, use the Google Photos button if you see it, or download photos from iCloud first.",
      },
      {
        q: "Which photo types can I upload?",
        a: "JPG, PNG and WebP. Photos from iPhones are usually converted to JPG automatically when you pick them. If one won't open, save it as a JPG first. Large photos are resized to 3,000 pixels on the longest side, which is enough for sharp prints.",
      },
      {
        q: "How do I put photos on a page?",
        a: "Upload photos in the Photos tab, then drag one onto a page, or tap it to fill the next empty spot. “Auto-fill empty spots” places all unused photos at once.",
      },
      {
        q: "How do I crop or adjust a photo?",
        a: "Tap the photo on the page. Use Zoom and the position sliders to crop, and Filters for black & white, sepia, brightness and contrast. You can also add a border, rounded corners or a shadow.",
      },
      {
        q: "Can I change the layout or style later?",
        a: "Yes. The Layouts tab changes how photos are arranged on the current page, and “Album style” changes colors and fonts on every page. Your photos and words stay.",
      },
      {
        q: "I made a mistake. Can I undo it?",
        a: "Yes. Use the undo and redo arrows at the top of the editor, or Ctrl+Z (Cmd+Z on Mac).",
      },
    ],
  },
  {
    title: "Printed books",
    items: [
      {
        q: "Can you print my book and send it to me?",
        a: "Yes. Sign in, open your book and click Order print. Enter how many copies you want and where to send them. There's nothing to pay online: we email you the price and delivery time to confirm before we print.",
      },
      {
        q: "How do I track my order?",
        a: "Open My orders from the menu. Each order shows where it is (confirmed, printing, shipped, delivered) and the tracking number once it ships.",
      },
      {
        q: "Can I change my book after ordering?",
        a: "Changes you make after ordering don't affect that order, which is printed exactly as it was when you ordered. To print the new version, place a new order. You can cancel an order yourself on My orders until we confirm it.",
      },
    ],
  },
  {
    title: "Printing & downloading",
    items: [
      {
        q: "How do I print at home?",
        a: (
          <>
            <p>Click Download, then Print now. In the print window:</p>
            <ul>
              <li>Set the scale to Actual size or 100%.</li>
              <li>Set margins to None.</li>
              <li>Choose paper that matches the album size. Letter and A4 albums fit standard printer paper.</li>
            </ul>
          </>
        ),
      },
      {
        q: "How do I get my album printed at a shop or online printer?",
        a: "Click Download, then PDF for printing. Pages are 300 DPI, which is standard print quality. Tell the shop the page size you chose, for example 8 × 8 inches. Some shops ask for “bleed”, a small extra edge that gets trimmed off. These PDFs don't include bleed, so keep important text and faces away from the very edges of pages.",
      },
      {
        q: "Which page sizes can I choose?",
        a: "8 × 8, 10 × 10 and 12 × 12 inch squares, US Letter, and A4, in portrait or landscape.",
      },
      {
        q: "Can I download pages as pictures?",
        a: "Yes. Click Download, then Page images (JPG). You get every page as a high-quality picture in one zip file.",
      },
    ],
  },
  {
    title: "Sharing & guest photos",
    items: [
      {
        q: "How do I share an album?",
        a: "Sign in, open the album, click Share and turn on “Anyone with the link can view”. Copy the link and send it to family and friends. They don't need an account to view it.",
      },
      {
        q: "Can guests add their own photos?",
        a: "Yes. In the Share window, turn on “Let guests add photos”. Guests open the link, enter their name and upload pictures. Their photos appear in your Photos tab with their names, and you choose which ones to place in the album.",
      },
      {
        q: "Can I stop sharing?",
        a: "Yes. Open Share and turn off the link. The link then stops working. You can also choose whether viewers can download a PDF.",
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        q: "Who can see my photos?",
        a: (
          <>
            Your albums are private unless you share them. See the{" "}
            <Link href="/privacy" className="font-semibold text-accent hover:underline">
              privacy policy
            </Link>{" "}
            for details.
          </>
        ),
      },
    ],
  },
];

export default function Faq() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Help & FAQ</h1>
        <p className="mt-2 text-muted">Answers to common questions about making, printing and sharing albums.</p>
        {sections.map((s) => (
          <section key={s.title} className="mt-10">
            <h2 className="font-display text-xl font-bold">{s.title}</h2>
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {s.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-paper [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-ink/80 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">{typeof item.a === "string" ? <p>{item.a}</p> : item.a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="mt-12 rounded-2xl bg-accent-soft p-6 text-center">
          <p className="font-semibold">Ready to start?</p>
          <Link href="/new" className="btn-primary mt-4">
            Make an album
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
