"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { FileImage, FileText, Loader2 } from "lucide-react";
import type { AlbumDoc, Photo } from "@/lib/types";

const AlbumViewer = dynamic(() => import("@/components/AlbumViewer"), { ssr: false, loading: () => <div className="aspect-square w-full animate-pulse rounded bg-line/50" /> });

/** The ordered book, with the print files the vendor needs. */
export default function BookFiles({ title, doc, photos }: { title: string; doc: AlbumDoc; photos: Photo[] }) {
  const photoMap = useMemo(() => Object.fromEntries(photos.map((p) => [p.id, p])), [photos]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(kind: "pdf" | "images") {
    setError("");
    setBusy("Preparing…");
    try {
      const { exportPdf, exportImages } = await import("@/lib/export");
      const fn = kind === "pdf" ? exportPdf : exportImages;
      await fn(doc, photoMap, title, (d, t) => setBusy(`Preparing page ${Math.min(d + 1, t)} of ${t}…`));
    } catch (e) {
      setError((e as Error).message || "Could not create the files.");
    }
    setBusy(null);
  }

  return (
    <section className="rounded-3xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title !mb-0">Book as ordered</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => run("pdf")} disabled={!!busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />}
            {busy ?? "Print PDF (300 DPI)"}
          </button>
          <button className="btn-secondary" onClick={() => run("images")} disabled={!!busy}>
            <FileImage className="h-4 w-4" aria-hidden /> Page images
          </button>
        </div>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6">
        <AlbumViewer doc={doc} photos={photoMap} reserve={320} />
      </div>
    </section>
  );
}
