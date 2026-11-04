"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AlbumDoc, PhotoMap } from "@/lib/types";
import { TEMPLATES, TRAVEL_BOOK_TEMPLATES, buildAlbumDoc, templateById } from "@/lib/templates";
import { autoFill } from "@/lib/doc";
import { samplePhotos } from "@/lib/samples";
import PagePreview from "./canvas/PagePreview";

export function useTemplatePreview(templateId: string, size: AlbumDoc["size"] = "8x8", title?: string, subtitle?: string) {
  const [state, setState] = useState<{ doc: AlbumDoc; photos: PhotoMap } | null>(null);
  useEffect(() => {
    const t = templateById(templateId);
    const photos = samplePhotos();
    const raw = buildAlbumDoc(t.id, size, title || t.titlePlaceholder, subtitle ?? t.subtitlePlaceholder);
    setState({ doc: autoFill(raw, Object.values(photos)).doc, photos });
  }, [templateId, size, title, subtitle]);
  return state;
}

export function TemplateCover({ templateId, className = "" }: { templateId: string; className?: string }) {
  const preview = useTemplatePreview(templateId);
  return (
    <div className={`overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/5 ${className}`}>
      {preview ? <PagePreview doc={preview.doc} page={preview.doc.pages[0]} photos={preview.photos} useThumbs={false} /> : <div className="aspect-square animate-pulse bg-line/50" />}
    </div>
  );
}

export default function TemplateShowcase({ variant }: { variant: "hero" | "grid" | "travel" }) {
  if (variant === "travel") {
    return (
      <div className="flex items-end justify-center gap-3 px-2">
        {TRAVEL_BOOK_TEMPLATES.slice(0, 4).map((id) => (
          <Link key={id} href="/trip" className="w-1/4 transition hover:-translate-y-2" aria-label={`${templateById(id).name} travel book`}>
            <TemplateCover templateId={id} className="rounded-l-sm rounded-r-md shadow-lg" />
          </Link>
        ))}
      </div>
    );
  }
  if (variant === "hero") {
    return (
      <div className="relative mx-auto aspect-[5/4] w-full max-w-md">
        <TemplateCover templateId="sky-atlas" className="absolute left-0 top-10 w-[52%] -rotate-6 rounded-l-sm rounded-r-lg shadow-2xl" />
        <TemplateCover templateId="peach-passport" className="absolute right-0 top-4 w-[52%] rotate-6 rounded-l-sm rounded-r-lg shadow-2xl" />
        <TemplateCover templateId="mint-coast" className="absolute left-1/2 top-0 z-10 w-[58%] -translate-x-1/2 rounded-l-sm rounded-r-lg shadow-2xl" />
      </div>
    );
  }
  const FEATURED = ["confetti-party", "butterfly-garden", "ivory-gold", "sage-blush", "sunny-escape", "retro-postcard", "little-one", "cap-and-gown", "midnight-gold", "family-moments", "furry-friends", "winter-wonderland"];
  const shown = FEATURED.map((id) => templateById(id));
  return (
    <>
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {shown.map((t) => (
        <Link key={t.id} href={`/new?template=${t.id}`} className="group">
          <TemplateCover templateId={t.id} className="transition group-hover:-translate-y-1 group-hover:shadow-xl" />
          <p className="mt-3 font-semibold">{t.name}</p>
          <p className="text-sm capitalize text-muted">{t.occasion === "other" ? "Any occasion" : t.occasion}</p>
        </Link>
      ))}
    </div>
    <div className="mt-8 text-center">
      <Link href="/new" className="btn-secondary">
        See all {TEMPLATES.length} templates
      </Link>
    </div>
    </>
  );
}
