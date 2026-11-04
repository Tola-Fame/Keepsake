"use client";

import { useRef, useState } from "react";
import { AlertCircle, Check, ImagePlus, Loader2, Trash2, Wand2 } from "lucide-react";
import type { EditorApi } from "../api";
import { autoFill, usedPhotoIds } from "@/lib/doc";
import GooglePhotosButton from "@/components/GooglePhotosButton";

export default function PhotosPanel({ ed }: { ed: EditorApi }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const used = usedPhotoIds(ed.doc);
  const guests = ed.photos.filter((p) => p.uploadedBy);
  const uploading = ed.uploads.filter((u) => u.status === "uploading").length;

  const fill = () => {
    const { doc, placed } = autoFill(ed.doc, ed.photos);
    if (placed) ed.updateDoc(() => doc);
    ed.notify(placed ? `Placed ${placed} photo${placed === 1 ? "" : "s"} into empty spots.` : "There are no empty photo spots, or every photo is already used.");
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          ed.uploadFiles(Array.from(e.dataTransfer.files));
        }}
        className={`rounded-xl border-2 border-dashed p-4 text-center transition ${over ? "border-accent bg-accent-soft" : "border-line"}`}
      >
        <button className="btn-primary w-full" onClick={() => input.current?.click()}>
          <ImagePlus className="h-4 w-4" aria-hidden /> Upload photos
        </button>
        <GooglePhotosButton className="btn-secondary mt-2 w-full" max={200} onPicked={(items) => ed.uploadFiles(items.map((i) => i.file))} />
        <p className="mt-2 text-xs text-muted">or drag photos here · JPG, PNG, WebP</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            ed.uploadFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>

      {uploading > 0 && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Uploading {uploading} photo{uploading === 1 ? "" : "s"}…
        </p>
      )}
      {ed.uploads
        .filter((u) => u.status === "error")
        .map((u) => (
          <p key={u.id} className="flex items-start gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {u.error}
          </p>
        ))}

      {ed.photos.length > 0 && (
        <>
          <button className="btn-secondary w-full" onClick={fill}>
            <Wand2 className="h-4 w-4" aria-hidden /> Auto-fill empty spots
          </button>
          <p className="text-xs text-muted">Drag a photo onto the page, or tap it to place it. Tap a photo on the page first to replace it.</p>
          <div className="grid grid-cols-3 gap-2">
            {ed.photos.map((p) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-line">
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-keepsake-photo", p.id);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => ed.placePhoto(p.id)}
                  className="h-full w-full"
                  title={p.uploadedBy ? `Added by ${p.uploadedBy}` : "Place on page"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>
                {used.has(p.id) && (
                  <span className="pointer-events-none absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white" title="Used in album">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                )}
                {p.uploadedBy && <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-[10px] text-white">{p.uploadedBy}</span>}
                <button
                  onClick={() => confirm("Delete this photo from the album?") && ed.removePhoto(p.id)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow group-hover:flex"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          {guests.length > 0 && <p className="text-xs text-muted">{guests.length} photo{guests.length === 1 ? " was" : "s were"} added by guests.</p>}
        </>
      )}
    </div>
  );
}
