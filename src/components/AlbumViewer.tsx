"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AlbumDoc, PhotoMap } from "@/lib/types";
import { pageDims } from "@/lib/pageSizes";
import PagePreview from "./canvas/PagePreview";

/** Page-by-page album viewer with arrows, keyboard and swipe navigation. */
export default function AlbumViewer({ doc, photos, reserve = 220, outsideArrows = false }: { doc: AlbumDoc; photos: PhotoMap; reserve?: number; outsideArrows?: boolean }) {
  const [i, setI] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const { w, h } = pageDims(doc.size);
  const n = doc.pages.length;
  const go = (d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-full"
        style={{ maxWidth: `min(100%, calc((100dvh - ${reserve}px) * ${w / h}))` }}
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        <div className="overflow-hidden rounded-sm bg-white shadow-2xl ring-1 ring-black/5">
          <PagePreview key={doc.pages[i].id} doc={doc} page={doc.pages[i]} photos={photos} useThumbs={false} />
        </div>
        <button onClick={() => go(-1)} disabled={i === 0} className={`absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow disabled:opacity-0 ${outsideArrows ? "lg:-left-14" : ""}`} aria-label="Previous page">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button onClick={() => go(1)} disabled={i === n - 1} className={`absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow disabled:opacity-0 ${outsideArrows ? "lg:-right-14" : ""}`} aria-label="Next page">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="mt-3 flex max-w-full flex-wrap justify-center">
        {doc.pages.map((p, k) => (
          <button key={p.id} onClick={() => setI(k)} className="flex h-8 items-center px-2" aria-label={`Go to page ${k + 1}`} aria-current={k === i ? "page" : undefined}>
            <span className={`block h-2 rounded-full transition-all ${k === i ? "w-6 bg-accent" : "w-2 bg-ink/20"}`} />
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">
        {i === 0 ? "Cover" : `Page ${i + 1}`} of {n}
      </p>
    </div>
  );
}
