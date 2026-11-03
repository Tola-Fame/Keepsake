"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { AlbumDoc, Page, PhotoMap } from "@/lib/types";
import { pageDims } from "@/lib/pageSizes";

const PageView = dynamic(() => import("./PageView"), { ssr: false });

/** A non-interactive page that scales to fill its container's width. */
export default function PagePreview({
  doc,
  page,
  photos,
  showPlaceholders = false,
  useThumbs = true,
  className = "",
}: {
  doc: AlbumDoc;
  page: Page;
  photos: PhotoMap;
  showPlaceholders?: boolean;
  useThumbs?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const { w, h } = pageDims(doc.size);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
      {width > 0 && (
        <div className="absolute inset-0">
          <PageView doc={doc} page={page} photos={photos} scale={width / w} showPlaceholders={showPlaceholders} useThumbs={useThumbs} />
        </div>
      )}
    </div>
  );
}
