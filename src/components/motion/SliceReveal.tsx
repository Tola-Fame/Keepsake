"use client";

import { useEffect, useRef, useState } from "react";

/** Reveals new content through horizontal slices that slide away whenever `revealKey` changes. */
export default function SliceReveal({ revealKey, children, bands = 6, className = "" }: { revealKey: string; children: React.ReactNode; bands?: number; className?: string }) {
  const first = useRef(true);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRun((r) => r + 1);
  }, [revealKey]);
  return (
    <div className={`relative ${className}`}>
      {children}
      {run > 0 && (
        <div key={run} className="slice-reveal" aria-hidden>
          {Array.from({ length: bands }, (_, i) => (
            <span key={i} style={{ top: `${(i / bands) * 100}%`, height: `${100 / bands + 0.5}%`, animationDelay: `${i * 45}ms`, ["--dir" as string]: i % 2 ? "-101%" : "101%" }} />
          ))}
        </div>
      )}
    </div>
  );
}
