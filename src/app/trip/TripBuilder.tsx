"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Cloud, HardDrive, ImagePlus, Loader2, X } from "lucide-react";
import { TRAVEL_BOOK_TEMPLATES, buildAlbumDoc, templateById } from "@/lib/templates";
import { PAGE_SIZE_LIST } from "@/lib/pageSizes";
import type { PageSizeId, Photo } from "@/lib/types";
import { docCover } from "@/lib/doc";
import { bgSolid } from "@/lib/backgrounds";
import { photoTakenAt } from "@/lib/exif";
import { MAX_TRIP_PHOTOS, buildTripDoc, dateRangeLabel, dayLabel, groupByDay, type TripPhoto } from "@/lib/trip";
import { localStore } from "@/lib/store/local";
import { cloudStore } from "@/lib/store/cloud";
import { useTemplatePreview } from "@/components/TemplateShowcase";
import PagePreview from "@/components/canvas/PagePreview";
import { useApp } from "@/components/AppProvider";

interface Picked {
  key: string;
  file: File;
  takenAt: number;
  url: string;
}

const isImage = (f: File) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(f.name);

export default function TripBuilder() {
  const router = useRouter();
  const { user } = useApp();
  const [templateId, setTemplateId] = useState(TRAVEL_BOOK_TEMPLATES[0]);
  const [size, setSize] = useState<PageSizeId>("8x8");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [picked, setPicked] = useState<Picked[]>([]);
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pickedRef = useRef(picked);
  pickedRef.current = picked;

  const t = templateById(templateId);
  const days = useMemo(() => groupByDay(picked), [picked]);
  const range = picked.length ? dateRangeLabel(days[0][0].takenAt, days[days.length - 1].at(-1)!.takenAt) : "";
  const preview = useTemplatePreview(templateId, size, title || t.titlePlaceholder, subtitle || range || t.subtitlePlaceholder);

  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list).filter(isImage);
    if (!files.length) return;
    setReading(true);
    setError("");
    const read = await Promise.all(
      files.map(async (file) => ({ key: `${file.name}-${file.size}-${file.lastModified}`, file, takenAt: await photoTakenAt(file), url: URL.createObjectURL(file) })),
    );
    const prev = pickedRef.current;
    const seen = new Set(prev.map((p) => p.key));
    const fresh = read.filter((p) => !seen.has(p.key));
    const room = Math.max(0, MAX_TRIP_PHOTOS - prev.length);
    read.filter((p) => seen.has(p.key)).forEach((p) => URL.revokeObjectURL(p.url));
    fresh.slice(room).forEach((p) => URL.revokeObjectURL(p.url));
    if (fresh.length > room) setError(`A travel book can hold up to ${MAX_TRIP_PHOTOS} photos. The extra photos were left out.`);
    setPicked([...prev, ...fresh.slice(0, room)]);
    setReading(false);
  }

  function removePhoto(key: string) {
    const p = pickedRef.current.find((x) => x.key === key);
    if (p) URL.revokeObjectURL(p.url);
    setPicked(pickedRef.current.filter((x) => x.key !== key));
  }

  async function create() {
    if (!picked.length) return;
    setError("");
    setProgress("Creating your book…");
    try {
      const store = user ? cloudStore : localStore;
      const finalTitle = title.trim() || t.titlePlaceholder;
      const finalSubtitle = subtitle.trim() || range;
      const draft = buildAlbumDoc(t.id, size, finalTitle, finalSubtitle);
      const id = await store.create({ title: finalTitle, occasion: "vacation", doc: draft, cover: docCover(draft, []) });

      // upload in date order, a few at a time, so photos keep that order in the editor
      const queue = [...picked].sort((a, b) => a.takenAt - b.takenAt);
      const total = queue.length;
      const done: TripPhoto[] = [];
      let failed = 0;
      setProgress(`Adding photos 0 of ${total}…`);
      await Promise.all(
        Array.from({ length: Math.min(3, queue.length) }, async () => {
          while (queue.length) {
            const p = queue.shift()!;
            try {
              const photo: Photo = await store.addPhoto(id, p.file);
              done.push({ photo, takenAt: p.takenAt });
            } catch {
              failed++;
            }
            setProgress(`Adding photos ${done.length + failed} of ${total}…`);
          }
        }),
      );
      if (!done.length) throw new Error("None of the photos could be added. Please try JPG, PNG or WebP files.");

      setProgress("Laying out your pages…");
      const doc = buildTripDoc(t.id, size, finalTitle, finalSubtitle, done);
      await store.save(id, { doc, cover: docCover(doc, done.map((d) => d.photo)) });
      router.push(user ? `/edit/${id}` : `/edit/local/${id}`);
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
      setProgress("");
    }
  }

  const busy = !!progress;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Make a travel book</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Add your trip photos. We sort them by the day they were taken, lay out a page for each day, and put the finished book on your bookshelf. You can change anything afterwards.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!busy) addFiles(e.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-accent bg-accent-soft" : "border-line bg-white"}`}
          >
            <ImagePlus className="mx-auto h-8 w-8 text-accent" aria-hidden />
            <p className="mt-3 font-semibold">Drop your trip photos here</p>
            <p className="mt-1 text-sm text-muted">Up to {MAX_TRIP_PHOTOS} photos. JPG, PNG or WebP.</p>
            <button className="btn-secondary mt-4" onClick={() => inputRef.current?.click()} disabled={busy || reading}>
              {reading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Choose photos
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {picked.length > 0 && (
            <div className="mt-8 space-y-6">
              <p className="text-sm text-muted">
                {picked.length} photos across {days.length} {days.length === 1 ? "day" : "days"} · {range}
              </p>
              {days.map((day, d) => (
                <div key={day[0].key}>
                  <h2 className="panel-title">
                    {dayLabel(d, day[0].takenAt)} <span className="font-normal text-muted">· {day.length} photos</span>
                  </h2>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {day.map((p) => (
                      <div key={p.key} className="group relative aspect-square overflow-hidden rounded-lg bg-line/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="h-full w-full object-cover" />
                        {!busy && (
                          <button
                            onClick={() => removePhoto(p.key)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                            aria-label="Remove photo"
                          >
                            <X className="h-3 w-3" aria-hidden />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit space-y-5 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <div className="mx-auto max-w-[260px] overflow-hidden rounded shadow-lg ring-1 ring-black/5">
            {preview ? <PagePreview doc={preview.doc} page={preview.doc.pages[0]} photos={preview.photos} useThumbs={false} /> : <div className="aspect-square bg-line/50" />}
          </div>
          <div>
            <p className="label">Cover color</p>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_BOOK_TEMPLATES.map((id) => {
                const x = templateById(id);
                const selected = id === templateId;
                return (
                  <button
                    key={id}
                    onClick={() => setTemplateId(id)}
                    title={x.name}
                    aria-label={x.name}
                    aria-pressed={selected}
                    className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/10 transition ${selected ? "ring-2 ring-ink ring-offset-2" : "hover:scale-110"}`}
                    style={{ background: bgSolid(x.theme.coverBackground ?? x.theme.background) }}
                  >
                    {selected && <Check className="h-4 w-4" style={{ color: x.theme.text }} aria-hidden />}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              {t.name}: {t.description}
            </p>
          </div>
          <div>
            <label className="label" htmlFor="title">Where did you go?</label>
            <input id="title" className="input" placeholder={t.titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
          </div>
          <div>
            <label className="label" htmlFor="subtitle">Subtitle (optional)</label>
            <input id="subtitle" className="input" placeholder={range || t.subtitlePlaceholder} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={80} />
          </div>
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
          <button className="btn-primary w-full py-3" onClick={create} disabled={busy || reading || !picked.length}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {progress || (picked.length ? "Make my travel book" : "Add photos to start")}
          </button>
        </aside>
      </div>
    </main>
  );
}
