"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CloudUpload, HardDrive, Loader2, Plus, Trash2 } from "lucide-react";
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

function AlbumCard({ a, onDelete, onMove, moving }: { a: AlbumSummary; onDelete: () => void; onMove?: () => void; moving?: string | null }) {
  const href = a.source === "cloud" ? `/edit/${a.id}` : `/edit/local/${a.id}`;
  return (
    <div className="group overflow-hidden rounded-2xl border border-line bg-white">
      <Link href={href} className="block aspect-[4/3] overflow-hidden" style={{ background: a.cover.bg }}>
        {a.cover.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.cover.thumb} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center font-display text-xl font-bold text-ink/70">{a.title}</div>
        )}
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link href={href} className="block truncate font-semibold hover:underline">
            {a.title}
          </Link>
          <p className="text-xs text-muted">
            {a.pageCount} pages · edited {timeAgo(a.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {onMove && (
            <button onClick={onMove} disabled={!!moving} className="rounded-full p-2 text-muted hover:bg-paper hover:text-ink" title="Save to my account" aria-label="Save to my account">
              {moving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CloudUpload className="h-4 w-4" aria-hidden />}
            </button>
          )}
          <button onClick={onDelete} className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600" title="Delete album" aria-label="Delete album">
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      {moving && <p className="px-4 pb-3 text-xs text-muted">{moving}</p>}
    </div>
  );
}

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
          <h1 className="font-display text-3xl font-bold sm:text-4xl">My albums</h1>
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
        <Link href="/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden /> New album
        </Link>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {empty && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-display text-2xl font-bold">No albums yet</p>
          <p className="mt-2 text-muted">Pick a template and add your photos to get started.</p>
          <Link href="/new" className="btn-primary mt-6">
            Start an album
          </Link>
        </div>
      )}

      {user && cloud && cloud.length > 0 && (
        <section className="mt-10">
          <h2 className="panel-title">Saved to your account</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cloud.map((a) => (
              <AlbumCard key={a.id} a={a} onDelete={() => del(a)} />
            ))}
          </div>
        </section>
      )}

      {local && local.length > 0 && (
        <section className="mt-10">
          <h2 className="panel-title flex items-center gap-2">
            <HardDrive className="h-4 w-4" aria-hidden /> On this device
          </h2>
          {user && <p className="-mt-1 mb-4 text-sm text-muted">Click the cloud button on an album to save it to your account so you can share it and open it anywhere.</p>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {local.map((a) => (
              <AlbumCard key={a.id} a={a} onDelete={() => del(a)} onMove={user ? () => move(a) : undefined} moving={moving[a.id] ?? null} />
            ))}
          </div>
        </section>
      )}

      {(local === null || (user && cloud === null && !error)) && (
        <div className="mt-10 flex items-center gap-2 text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading albums…
        </div>
      )}
    </main>
  );
}
