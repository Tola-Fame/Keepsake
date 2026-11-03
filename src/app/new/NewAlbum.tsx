"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check, Cloud, HardDrive, Loader2 } from "lucide-react";
import { OCCASIONS, TEMPLATES, buildAlbumDoc, templateById, type Occasion } from "@/lib/templates";
import { PAGE_SIZE_LIST } from "@/lib/pageSizes";
import type { PageSizeId } from "@/lib/types";
import { docCover } from "@/lib/doc";
import { localStore } from "@/lib/store/local";
import { cloudStore } from "@/lib/store/cloud";
import { TemplateCover, useTemplatePreview } from "@/components/TemplateShowcase";
import PagePreview from "@/components/canvas/PagePreview";
import { useApp } from "@/components/AppProvider";

export default function NewAlbum() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useApp();
  const initial = templateById(params.get("template") || "confetti-party");
  const [templateId, setTemplateId] = useState(initial.id);
  const [filter, setFilter] = useState<Occasion | "all">("all");
  const [size, setSize] = useState<PageSizeId>("8x8");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = templateById(templateId);
  const preview = useTemplatePreview(templateId, size, title || t.titlePlaceholder, subtitle || t.subtitlePlaceholder);

  const shown = filter === "all" ? TEMPLATES : TEMPLATES.filter((x) => x.occasion === filter);

  async function create() {
    setBusy(true);
    setError("");
    try {
      const finalTitle = title.trim() || t.titlePlaceholder;
      const doc = buildAlbumDoc(t.id, size, finalTitle, subtitle.trim());
      const input = { title: finalTitle, occasion: t.occasion, doc, cover: docCover(doc, []) };
      if (user) {
        const id = await cloudStore.create(input);
        router.push(`/edit/${id}`);
      } else {
        const id = await localStore.create(input);
        router.push(`/edit/local/${id}`);
      }
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Start a new album</h1>
      <p className="mt-2 text-muted">Choose a design. You can change everything later.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-5 flex flex-wrap gap-2">
            {[{ id: "all" as const, label: "All" }, ...OCCASIONS].map((o) => (
              <button
                key={o.id}
                onClick={() => setFilter(o.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${filter === o.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/30"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {shown.map((x) => (
              <button key={x.id} onClick={() => setTemplateId(x.id)} className="group text-left" aria-pressed={x.id === templateId}>
                <div className={`relative rounded-lg p-1 transition ${x.id === templateId ? "bg-accent" : "bg-transparent group-hover:bg-line"}`}>
                  <TemplateCover templateId={x.id} />
                  {x.id === templateId && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold">{x.name}</p>
                <p className="text-xs text-muted">{x.description}</p>
              </button>
            ))}
          </div>
        </section>

        <aside className="h-fit space-y-5 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <div className="mx-auto max-w-[260px] overflow-hidden rounded shadow-lg ring-1 ring-black/5">
            {preview ? <PagePreview doc={preview.doc} page={preview.doc.pages[0]} photos={preview.photos} useThumbs={false} /> : <div className="aspect-square bg-line/50" />}
          </div>
          <div>
            <label className="label" htmlFor="title">Album title</label>
            <input id="title" className="input" placeholder={t.titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
          </div>
          {t.id !== "blank" || subtitle ? (
            <div>
              <label className="label" htmlFor="subtitle">Subtitle (optional)</label>
              <input id="subtitle" className="input" placeholder={t.subtitlePlaceholder || "A date, names or place"} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={80} />
            </div>
          ) : null}
          <div>
            <label className="label" htmlFor="size">Page size</label>
            <select id="size" className="input" value={size} onChange={(e) => setSize(e.target.value as PageSizeId)}>
              {PAGE_SIZE_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}: {s.description}
                </option>
              ))}
            </select>
          </div>
          <p className="flex items-start gap-2 text-xs text-muted">
            {user ? <Cloud className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <HardDrive className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
            {user ? "Saved to your account. Open it on any device." : "Saved in this browser. Sign in any time to save it to an account."}
          </p>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full py-3" onClick={create} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Create album
          </button>
        </aside>
      </div>
    </main>
  );
}
