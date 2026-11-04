"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, Minus, Package, Plus, Truck } from "lucide-react";
import type { AlbumDoc, Photo, ShippingAddress } from "@/lib/types";
import { PAGE_SIZES } from "@/lib/pageSizes";
import { MAX_ORDER_QUANTITY } from "@/lib/orders";
import PagePreview from "@/components/canvas/PagePreview";

const FIELDS: { key: keyof ShippingAddress; label: string; autoComplete: string; required?: boolean; half?: boolean; type?: string }[] = [
  { key: "name", label: "Full name", autoComplete: "name", required: true },
  { key: "email", label: "Email", autoComplete: "email", required: true, half: true, type: "email" },
  { key: "phone", label: "Phone (for the courier)", autoComplete: "tel", half: true, type: "tel" },
  { key: "line1", label: "Street address", autoComplete: "address-line1", required: true },
  { key: "line2", label: "Apartment, suite, etc. (optional)", autoComplete: "address-line2" },
  { key: "city", label: "City", autoComplete: "address-level2", required: true, half: true },
  { key: "region", label: "State / region", autoComplete: "address-level1", half: true },
  { key: "postalCode", label: "Postal code", autoComplete: "postal-code", half: true },
  { key: "country", label: "Country", autoComplete: "country-name", required: true, half: true },
];

export default function OrderForm({
  album,
  defaults,
}: {
  album: { id: string; title: string; doc: AlbumDoc; photos: Photo[] };
  defaults: { name: string; email: string };
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState<ShippingAddress>({ name: defaults.name, email: defaults.email, phone: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "" });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photoMap = useMemo(() => Object.fromEntries(album.photos.map((p) => [p.id, p])), [album.photos]);
  const size = PAGE_SIZES[album.doc.size];
  const editHref = `/edit/${album.id}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ albumId: album.id, quantity, shipping, notes }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Your order could not be placed. Please try again.");
      router.push(`/orders?placed=${data.number}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link href={editHref} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to editing
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Order your printed book</h1>
      <p className="mt-2 max-w-2xl text-muted">We print your book on quality paper, bind it, and ship it to your door. There&apos;s nothing to pay now: we&apos;ll email you the price and delivery time to confirm before printing.</p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <Truck className="h-5 w-5 text-accent" aria-hidden /> Where should we send it?
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.key} className={f.half ? "" : "sm:col-span-2"}>
                  <label className="label" htmlFor={f.key}>
                    {f.label}
                  </label>
                  <input
                    id={f.key}
                    className="input"
                    type={f.type ?? "text"}
                    autoComplete={f.autoComplete}
                    required={f.required}
                    value={shipping[f.key]}
                    onChange={(e) => setShipping((s) => ({ ...s, [f.key]: e.target.value }))}
                    maxLength={200}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <label className="label" htmlFor="notes">
              Anything we should know? (optional)
            </label>
            <textarea id="notes" className="input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="A gift message, a date you need it by…" />
          </div>
        </section>

        <aside className="h-fit space-y-5 rounded-3xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <div className="mx-auto w-48 overflow-hidden rounded-l-sm rounded-r-lg shadow-lg ring-1 ring-black/5">
            <PagePreview doc={album.doc} page={album.doc.pages[0]} photos={photoMap} useThumbs={false} />
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-bold">{album.title}</p>
            <p className="text-sm text-muted">
              {size.label} · {album.doc.pages.length} pages
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-paper p-3">
            <span className="text-sm font-semibold">Copies</span>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary h-9 w-9 p-0" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="One fewer copy">
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="w-8 text-center font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button type="button" className="btn-secondary h-9 w-9 p-0" onClick={() => setQuantity((q) => Math.min(MAX_ORDER_QUANTITY, q + 1))} disabled={quantity >= MAX_ORDER_QUANTITY} aria-label="One more copy">
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted">The book is printed exactly as it looks now. Edits you make after ordering won&apos;t change this order.</p>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full py-3" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Package className="h-4 w-4" aria-hidden />}
            Place order
          </button>
        </aside>
      </form>
    </main>
  );
}
