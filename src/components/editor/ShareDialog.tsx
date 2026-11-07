"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, X } from "lucide-react";
import type { Album } from "@/lib/types";
import { cloudStore } from "@/lib/store/cloud";
import { Toggle } from "./controls";
import { useApp } from "../AppProvider";

type Settings = Pick<Album, "shareToken" | "shareEnabled" | "allowGuestUploads" | "allowDownload">;

export default function ShareDialog({
  album,
  settings,
  onChange,
  onClose,
  onMoveToCloud,
}: {
  album: Album;
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
  onMoveToCloud: () => void;
}) {
  const { config, user } = useApp();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const link = settings.shareToken && typeof window !== "undefined" ? `${window.location.origin}/s/${settings.shareToken}` : "";

  async function update(patch: Partial<Settings>) {
    setBusy(true);
    setError("");
    try {
      const res = await cloudStore.save(album.id, patch);
      onChange({ shareToken: res.shareToken, shareEnabled: res.shareEnabled, allowGuestUploads: res.allowGuestUploads, allowDownload: res.allowDownload });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="share-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="share-title" className="font-display text-xl font-bold">
            Share album
          </h2>
          <button onClick={onClose} className="-mr-2 rounded-full p-2.5 hover:bg-paper" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {album.source === "local" ? (
          <div className="space-y-4 text-sm">
            <p className="text-muted">This album is saved in this browser only. To share it, save it to an account first.</p>
            {!config.cloud ? (
              <p className="rounded-lg bg-paper p-3 text-muted">Sharing will be available once the site owner turns on accounts.</p>
            ) : user ? (
              <button className="btn-primary w-full" onClick={onMoveToCloud}>
                Save to my account
              </button>
            ) : (
              <Link href={`/signin?next=/albums`} className="btn-primary w-full">
                Sign in to share
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <Toggle label="Anyone with the link can view" checked={!!settings.shareEnabled} onChange={(v) => update({ shareEnabled: v })} />
            {settings.shareEnabled && link && (
              <>
                <div className="flex gap-2">
                  <input className="input" readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Share link" />
                  <button
                    className="btn-secondary shrink-0 px-3"
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="space-y-4 rounded-xl border border-line p-4">
                  <Toggle label="Let guests add photos" checked={!!settings.allowGuestUploads} onChange={(v) => update({ allowGuestUploads: v })} />
                  <p className="-mt-2 text-xs text-muted">Guests enter their name and upload pictures. You will see them in your Photos tab.</p>
                  <Toggle label="Let viewers download a PDF" checked={!!settings.allowDownload} onChange={(v) => update({ allowDownload: v })} />
                </div>
              </>
            )}
            {busy && (
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…
              </p>
            )}
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
