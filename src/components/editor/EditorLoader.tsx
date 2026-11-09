"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import Buddy from "@/components/motion/Buddy";
import type { Album } from "@/lib/types";
import { localStore } from "@/lib/store/local";

const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <Loading />,
});

function Loading() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 font-bold text-muted">
      <Buddy size={64} />
      <span>Opening your book…</span>
    </div>
  );
}

/** Opens a cloud album (passed from the server) or a browser-only album (read from IndexedDB). */
export default function EditorLoader({ album, localId }: { album?: Album; localId?: string }) {
  const [local, setLocal] = useState<Album | null | undefined>(undefined);
  useEffect(() => {
    if (localId) localStore.get(localId).then(setLocal).catch(() => setLocal(null));
  }, [localId]);

  if (album) return <Editor album={album} />;
  if (local === undefined) return <Loading />;
  if (local === null)
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-2xl font-bold">Album not found</p>
        <p className="max-w-sm text-muted">This album is not saved in this browser. Albums made without an account only open on the device and browser where they were made.</p>
        <Link href="/albums" className="btn-primary">
          Go to my albums
        </Link>
      </div>
    );
  return <Editor album={local} />;
}
