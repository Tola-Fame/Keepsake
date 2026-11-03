"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Check, Download, ImagePlus, Loader2 } from "lucide-react";
import type { AlbumDoc, Photo } from "@/lib/types";
import { guestUpload } from "@/lib/store/cloud";
import { Logo } from "@/components/Header";

const AlbumViewer = dynamic(() => import("@/components/AlbumViewer"), { ssr: false, loading: () => <div className="aspect-square w-full max-w-xl animate-pulse rounded bg-line/50" /> });

function readName() {
  try {
    return localStorage.getItem("keepsake-guest-name") || "";
  } catch {
    return "";
  }
}

export default function ShareView({
  token,
  albumId,
  title,
  doc,
  photos,
  allowDownload,
  allowGuestUploads,
}: {
  token: string;
  albumId: string;
  title: string;
  doc: AlbumDoc;
  photos: Photo[];
  allowDownload: boolean;
  allowGuestUploads: boolean;
}) {
  const photoMap = useMemo(() => Object.fromEntries(photos.map((p) => [p.id, p])), [photos]);
  const [guestPhotos, setGuestPhotos] = useState(photos.filter((p) => p.uploadedBy));
  const [name, setName] = useState(readName);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: File[]) {
    if (!name.trim()) {
      setError("Please enter your name first.");
      return;
    }
    try {
      localStorage.setItem("keepsake-guest-name", name.trim());
    } catch {
      /* ignore */
    }
    setError("");
    setMessage("");
    let done = 0;
    let failed = 0;
    setBusy({ done, total: files.length });
    for (const f of files) {
      try {
        const p = await guestUpload(token, albumId, f, name.trim());
        setGuestPhotos((g) => [...g, p]);
      } catch (e) {
        failed++;
        setError(`${f.name}: ${(e as Error).message}`);
      }
      setBusy({ done: ++done, total: files.length });
    }
    setBusy(null);
    if (done - failed > 0) setMessage(`Thank you! ${done - failed} photo${done - failed === 1 ? " was" : "s were"} added for the album owner.`);
  }

  async function download() {
    setExporting("Preparing PDF…");
    try {
      const { exportPdf } = await import("@/lib/export");
      await exportPdf(doc, photoMap, title, (d, t) => setExporting(`Preparing page ${Math.min(d + 1, t)} of ${t}…`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="min-h-dvh bg-[#efe9e0]">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Logo />
        {allowDownload && (
          <button className="btn-secondary" onClick={download} disabled={!!exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">{exporting ?? "Download PDF"}</span>
          </button>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <h1 className="mb-6 text-center font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <AlbumViewer doc={doc} photos={photoMap} />

        {allowGuestUploads && (
          <section className="mx-auto mt-14 max-w-2xl rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-bold">Add your photos</h2>
            <p className="mt-1 text-sm text-muted">Were you there? Share your pictures and the album owner can add them to the album.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input className="input py-3" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Your name" />
              <button className="btn-primary shrink-0 py-3" onClick={() => (name.trim() ? input.current?.click() : setError("Please enter your name first."))} disabled={!!busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
                {busy ? `Uploading ${busy.done} of ${busy.total}` : "Choose photos"}
              </button>
              <input
                ref={input}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  upload(Array.from(e.target.files || []));
                  e.target.value = "";
                }}
              />
            </div>
            {message && (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <Check className="h-4 w-4" aria-hidden /> {message}
              </p>
            )}
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {guestPhotos.length > 0 && (
              <>
                <h3 className="panel-title mt-6">Photos from guests ({guestPhotos.length})</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {guestPhotos.map((p) => (
                    <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg bg-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumb} alt={`Photo from ${p.uploadedBy}`} className="h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">{p.uploadedBy}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <p className="mt-14 text-center text-sm text-muted">
          Made with Keepsake.{" "}
          <Link href="/new" className="font-semibold text-accent hover:underline">
            Make your own album
          </Link>
        </p>
      </main>
    </div>
  );
}
