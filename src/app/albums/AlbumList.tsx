"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CloudUpload, HardDrive, Loader2, Plane, Plus, Trash2 } from "lucide-react";
import type { AlbumSummary } from "@/lib/types";
import { localStore } from "@/lib/store/local";
import { cloudStore } from "@/lib/store/cloud";
import { moveLocalAlbumToCloud } from "@/lib/store";
import { useApp } from "@/components/AppProvider";

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ts).toLocaleDateString();
}

/** True for dark cover colors, so the title can switch to white. */
function isDark(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 140;
}

function Book({ a, onDelete, onMove, moving }: { a: AlbumSummary; onDelete: () => void; onMove?: () => void; moving?: string | null }) {
  const href = a.source === "cloud" ? `/edit/${a.id}` : `/edit/local/${a.id}`;
  const dark = isDark(a.cover.bg);
  return (
    <div className="group flex flex-col">
      <div className="flex h-[220px] items-end justify-center">
        <Link
          href={href}
          className="relative block h-[188px] w-[150px] overflow-hidden rounded-l-[3px] rounded-r-lg shadow-[4px_6px_14px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-2 group-hover:shadow-[6px_14px_24px_rgba(0,0,0,0.22)]"
          style={{ background: a.cover.bg }}
        >
          {/* spine */}
          <span className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 via-black/5 to-transparent" aria-hidden />
          <span className="absolute inset-y-0 left-3 w-px bg-white/40" aria-hidden />
          <div className="flex h-full flex-col gap-2 py-3 pl-5 pr-3">
            <p className={`line-clamp-2 shrink-0 font-display text-base font-bold leading-tight ${dark ? "text-white" : "text-ink/80"}`}>{a.title}</p>
            {a.cover.thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.cover.thumb} alt="" className="mt-auto min-h-0 w-full flex-1 rounded-md object-cover shadow ring-4 ring-white/80" />
            )}
          </div>
        </Link>
      </div>
      <div className="flex items-start justify-between gap-2 px-3 pt-4">
        <div className="min-w-0">
          <Link href={href} className="block truncate text-sm font-semibold hover:underline">
            {a.title}
          </Link>
          <p className="text-xs text-muted">
            {a.pageCount} pages · {timeAgo(a.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0">
          {onMove && (
            <button onClick={onMove} disabled={!!moving} className="rounded-full p-1.5 text-muted hover:bg-white hover:text-ink" title="Save to my account" aria-label="Save to my account">
              {moving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CloudUpload className="h-4 w-4" aria-hidden />}
            </button>
          )}
          <button onClick={onDelete} className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600" title="Delete book" aria-label="Delete book">
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      {moving && <p className="px-3 pt-1 text-xs text-muted">{moving}</p>}
    </div>
  );
}

// Fixed-height rows with a wooden plank drawn under each one, so every row reads as one shelf.
const SHELF =
  "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] auto-rows-[300px] bg-[repeating-linear-gradient(to_bottom,transparent_0_220px,#e9dcc8_220px,#d8c6ab_232px,rgba(0,0,0,0.08)_232px,transparent_238px,transparent_300px)]";

export default function AlbumList() {
  const { user, config } = useApp();
  const router = useRouter();
  const [local, setLocal] = useState<AlbumSummary[] | null>(null);
  const [cloud, setCloud] = useState<AlbumSummary[] | null>(null);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    localStore.list().then(setLocal).catch(() => setLocal([]));
    if (user) cloudStore.list().then(setCloud).catch((e) => setError(e.message));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function del(a: AlbumSummary) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    try {
      if (a.source === "cloud") await cloudStore.remove(a.id);
      else await localStore.remove(a.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function move(a: AlbumSummary) {
    setMoving((m) => ({ ...m, [a.id]: "Preparing…" }));
    try {
      const id = await moveLocalAlbumToCloud(a.id, (d, t) => setMoving((m) => ({ ...m, [a.id]: `Uploading photos ${d} of ${t}…` })));
      router.push(`/edit/${id}`);
    } catch (e) {
      setError(`Could not move "${a.title}": ${(e as Error).message}`);
      setMoving((m) => {
        const n = { ...m };
        delete n[a.id];
        return n;
      });
    }
  }

  const empty = local?.length === 0 && (!user || cloud?.length === 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">My bookshelf</h1>
          {config.cloud && !user && (
            <p className="mt-2 text-sm text-muted">
              Albums below are saved in this browser only.{" "}
              <Link href="/signin?next=/albums" className="font-semibold text-accent hover:underline">
                Sign in
              </Link>{" "}
              to save them online and share them.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/trip" className="btn-secondary">
            <Plane className="h-4 w-4" aria-hidden /> Travel book
          </Link>
          <Link href="/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New album
          </Link>
        </div>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {empty && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-display text-2xl font-bold">Your bookshelf is empty</p>
          <p className="mt-2 text-muted">Drop in photos from a trip and we&apos;ll make the book for you, or start any album from a template.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/trip" className="btn-primary">
              <Plane className="h-4 w-4" aria-hidden /> Make a travel book
            </Link>
            <Link href="/new" className="btn-secondary">
              Start an album
            </Link>
          </div>
        </div>
      )}

      {user && cloud && cloud.length > 0 && (
        <section className="mt-10">
          <h2 className="panel-title">Saved to your account</h2>
          <div className={SHELF}>
            {cloud.map((a) => (
              <Book key={a.id} a={a} onDelete={() => del(a)} />
            ))}
          </div>
        </section>
      )}

      {local && local.length > 0 && (
        <section className="mt-10">
          <h2 className="panel-title flex items-center gap-2">
            <HardDrive className="h-4 w-4" aria-hidden /> On this device
          </h2>
          {user && <p className="-mt-1 mb-4 text-sm text-muted">Click the cloud button under a book to save it to your account so you can share it and open it anywhere.</p>}
          <div className={SHELF}>
            {local.map((a) => (
              <Book key={a.id} a={a} onDelete={() => del(a)} onMove={user ? () => move(a) : undefined} moving={moving[a.id] ?? null} />
            ))}
          </div>
        </section>
      )}

      {(local === null || (user && cloud === null && !error)) && (
        <div className="mt-10 flex items-center gap-2 text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading your bookshelf…
        </div>
      )}
    </main>
  );
}
