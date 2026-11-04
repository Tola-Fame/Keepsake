"use client";

// Lets people pick photos from their Google Photos library with Google's Photos Picker.
// Photos are downloaded into the browser and then handled like any other upload.

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useApp } from "./AppProvider";

const SCOPE = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";
const API = "https://photospicker.googleapis.com/v1";

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (r: TokenResponse) => void;
            error_callback?: (e: { type: string }) => void;
          }): { requestAccessToken(): void };
        };
      };
    };
  }
}

interface PickerSession {
  id: string;
  pickerUri: string;
  mediaItemsSet?: boolean;
  pollingConfig?: { pollInterval?: string; timeoutIn?: string };
}

interface PickedItem {
  id: string;
  createTime: string;
  type: string;
  mediaFile: { baseUrl: string; mimeType: string; filename?: string };
}

export interface GooglePhoto {
  file: File;
  takenAt: number;
}

let gisLoading: Promise<void> | null = null;
function loadGis() {
  gisLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisLoading = null;
      reject(new Error("Could not reach Google. Check your connection and try again."));
    };
    document.head.appendChild(s);
  });
  return gisLoading;
}

let cachedToken: { token: string; expires: number } | null = null;

function requestToken(clientId: string): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return Promise.resolve(cachedToken.token);
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (r) => {
        if (!r.access_token) return reject(new Error(r.error === "access_denied" ? "cancelled" : "Google did not allow access to your photos."));
        cachedToken = { token: r.access_token, expires: Date.now() + (r.expires_in ?? 3600) * 1000 };
        resolve(r.access_token);
      },
      error_callback: (e) => reject(new Error(e.type === "popup_closed" ? "cancelled" : "The Google sign-in window was blocked. Please allow pop-ups for this site.")),
    });
    client.requestAccessToken();
  });
}

async function api<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } });
  if (!res.ok) throw new Error(res.status === 403 ? "Google Photos isn't set up for this site yet." : "Google Photos is not responding. Please try again.");
  return res.status === 204 ? (undefined as T) : res.json();
}

const seconds = (d: string | undefined, fallback: number) => (d ? parseFloat(d) : fallback) * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Downloads one picked photo. Tries Google directly, then through this site if the browser blocks it. */
async function download(item: PickedItem, token: string): Promise<GooglePhoto> {
  const takenAt = Date.parse(item.createTime) || Date.now();
  let res = await fetch(`${item.mediaFile.baseUrl}=w3000-h3000`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  if (!res?.ok) {
    res = await fetch("/api/google-photos", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${item.mediaFile.baseUrl}=w2400-h2400` }),
    });
  }
  if (!res.ok) throw new Error("A photo could not be downloaded from Google Photos.");
  const blob = await res.blob();
  const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  const name = (item.mediaFile.filename || `google-photo-${item.id}`).replace(/\.(heic|heif)$/i, ".jpg");
  return { file: new File([blob], name, { type, lastModified: takenAt }), takenAt };
}

type Step = { kind: "idle" } | { kind: "auth" } | { kind: "ready"; token: string; session: PickerSession } | { kind: "picking" } | { kind: "downloading"; done: number; total: number };

export default function GooglePhotosButton({ onPicked, max, disabled, className = "btn-secondary" }: { onPicked: (photos: GooglePhoto[]) => void; max: number; disabled?: boolean; className?: string }) {
  const { config } = useApp();
  const clientId = config.googlePhotosClientId;
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [error, setError] = useState("");
  const cancelled = useRef(false);

  useEffect(() => {
    if (clientId) loadGis().catch(() => undefined);
  }, [clientId]);

  if (!clientId) return null;

  async function start() {
    setError("");
    cancelled.current = false;
    setStep({ kind: "auth" });
    try {
      await loadGis();
      const token = await requestToken(clientId!);
      const session = await api<PickerSession>(token, "/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pickingConfig: { maxItemCount: String(Math.max(1, max)) } }) });
      // opening the picker needs a fresh click, or the browser blocks the window
      setStep({ kind: "ready", token, session });
    } catch (e) {
      fail(e);
    }
  }

  async function pick(token: string, session: PickerSession) {
    window.open(`${session.pickerUri}/autoclose`, "google-photos", "width=1000,height=760");
    setStep({ kind: "picking" });
    try {
      const interval = seconds(session.pollingConfig?.pollInterval, 3);
      const deadline = Date.now() + seconds(session.pollingConfig?.timeoutIn, 1800);
      let s = session;
      while (!s.mediaItemsSet) {
        if (cancelled.current) return;
        if (Date.now() > deadline) throw new Error("The Google Photos window timed out. Please try again.");
        await sleep(interval);
        s = await api<PickerSession>(token, `/sessions/${session.id}`);
      }
      const items: PickedItem[] = [];
      let pageToken = "";
      do {
        const r = await api<{ mediaItems?: PickedItem[]; nextPageToken?: string }>(token, `/mediaItems?sessionId=${session.id}&pageSize=100${pageToken ? `&pageToken=${pageToken}` : ""}`);
        items.push(...(r.mediaItems ?? []));
        pageToken = r.nextPageToken ?? "";
      } while (pageToken);
      const photos = items.filter((i) => i.type === "PHOTO").slice(0, max);

      const done: GooglePhoto[] = [];
      let failed = 0;
      setStep({ kind: "downloading", done: 0, total: photos.length });
      const queue = [...photos];
      await Promise.all(
        Array.from({ length: Math.min(4, queue.length) }, async () => {
          while (queue.length && !cancelled.current) {
            const item = queue.shift()!;
            try {
              done.push(await download(item, token));
            } catch {
              failed++;
            }
            setStep({ kind: "downloading", done: done.length + failed, total: photos.length });
          }
        }),
      );
      api(token, `/sessions/${session.id}`, { method: "DELETE" }).catch(() => undefined);
      if (cancelled.current) return;
      if (done.length) onPicked(done);
      setStep({ kind: "idle" });
      if (failed) setError(`${failed} photo${failed === 1 ? "" : "s"} could not be downloaded from Google Photos.`);
    } catch (e) {
      fail(e);
    }
  }

  function fail(e: unknown) {
    const msg = (e as Error).message;
    setStep({ kind: "idle" });
    if (msg !== "cancelled") setError(msg || "Something went wrong with Google Photos.");
  }

  function cancel() {
    cancelled.current = true;
    setStep({ kind: "idle" });
  }

  const busy = step.kind !== "idle";

  return (
    <>
      <button type="button" className={className} onClick={start} disabled={disabled || busy || max < 1}>
        {step.kind === "auth" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <GoogleMark />}
        Google Photos
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {(step.kind === "ready" || step.kind === "picking" || step.kind === "downloading") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="gp-title">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <button className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-black/5" onClick={cancel} aria-label="Cancel">
              <X className="h-4 w-4" aria-hidden />
            </button>
            <GoogleMark className="mx-auto h-8 w-8" />
            {step.kind === "ready" && (
              <>
                <h2 id="gp-title" className="mt-3 font-display text-xl font-bold">
                  Choose your photos
                </h2>
                <p className="mt-2 text-sm text-muted">Google Photos opens in a new window. Pick your photos there, press Done, and come back here.</p>
                <button className="btn-primary mt-5 w-full" onClick={() => pick(step.token, step.session)}>
                  Open Google Photos
                </button>
              </>
            )}
            {step.kind === "picking" && (
              <>
                <h2 id="gp-title" className="mt-3 font-display text-xl font-bold">
                  Waiting for Google Photos…
                </h2>
                <p className="mt-2 text-sm text-muted">Pick your photos in the Google Photos window and press Done.</p>
                <Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin text-accent" aria-hidden />
              </>
            )}
            {step.kind === "downloading" && (
              <>
                <h2 id="gp-title" className="mt-3 font-display text-xl font-bold">
                  Bringing in your photos
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {step.done} of {step.total}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-accent transition-all" style={{ width: `${step.total ? (step.done / step.total) * 100 : 0}%` }} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Google Photos' four-petal mark, drawn simply. */
function GoogleMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2a5 5 0 0 1 5 5v5h-5z" fill="#ea4335" />
      <path d="M22 12a5 5 0 0 1-5 5h-5v-5z" fill="#4285f4" />
      <path d="M12 22a5 5 0 0 1-5-5v-5h5z" fill="#34a853" />
      <path d="M2 12a5 5 0 0 1 5-5h5v5z" fill="#fbbc04" />
    </svg>
  );
}
