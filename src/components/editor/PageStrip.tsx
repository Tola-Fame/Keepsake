"use client";

import { memo, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import type { AlbumDoc, Page, PhotoMap } from "@/lib/types";
import PagePreview from "../canvas/PagePreview";
import { IconButton } from "./controls";

const Thumb = memo(function Thumb({ doc, page, photos }: { doc: AlbumDoc; page: Page; photos: PhotoMap }) {
  return <PagePreview doc={doc} page={page} photos={photos} showPlaceholders useThumbs />;
});

export default function PageStrip({
  doc,
  photos,
  index,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
}: {
  doc: AlbumDoc;
  photos: PhotoMap;
  index: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (from: number, to: number) => void;
}) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const portrait = doc.size === "8.5x11" || doc.size === "a4";
  return (
    <div className="flex items-center gap-2 border-t border-line bg-white px-2 py-2">
      <div className="hidden shrink-0 flex-col gap-0.5 sm:flex">
        <IconButton label="Move page left" onClick={() => onMove(index, index - 1)} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4" />
        </IconButton>
        <IconButton label="Move page right" onClick={() => onMove(index, index + 1)} disabled={index === doc.pages.length - 1}>
          <ChevronRight className="h-4 w-4" />
        </IconButton>
      </div>
      <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto px-1 pb-1 pt-1">
        {doc.pages.map((p, i) => (
          <button
            key={p.id}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => dragFrom !== null && e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null && dragFrom !== i) onMove(dragFrom, i);
              setDragFrom(null);
            }}
            onClick={() => onSelect(i)}
            className={`shrink-0 text-center ${portrait ? "w-14" : "w-20"}`}
            aria-label={`Page ${i + 1}`}
          >
            <div className={`overflow-hidden rounded-sm shadow-sm ring-offset-1 transition ${i === index ? "ring-2 ring-accent" : "ring-1 ring-black/10 hover:ring-black/30"}`}>
              <Thumb doc={doc} page={p} photos={photos} />
            </div>
            <span className={`mt-1 block text-[11px] ${i === index ? "font-semibold text-accent-dark" : "text-muted"}`}>{i === 0 ? "Cover" : i + 1}</span>
          </button>
        ))}
        <button onClick={onAdd} className={`flex shrink-0 flex-col items-center justify-center rounded-sm border-2 border-dashed border-line text-muted hover:border-accent hover:text-accent ${portrait ? "h-[75px] w-14" : "h-20 w-20"}`} aria-label="Add page">
          <Plus className="h-5 w-5" aria-hidden />
          <span className="text-[11px]">Add</span>
        </button>
      </div>
      <div className="flex shrink-0 flex-col gap-0.5">
        <IconButton label="Duplicate page" onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
        </IconButton>
        <IconButton label="Delete page" onClick={onDelete} disabled={doc.pages.length <= 1}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
