"use client";

import { useState } from "react";
import type { Background } from "@/lib/types";
import { GRADIENTS, PATTERNS, bgCss } from "@/lib/backgrounds";
import { ColorPicker, Toggle } from "../controls";
import type { EditorApi } from "../api";

function PatternSwatch({ bg }: { bg: Extract<Background, { type: "pattern" }> }) {
  // CSS approximation used only for the small preview button
  const c = bg.color;
  const css: Record<string, string> = {
    dots: `radial-gradient(${c} 22%, transparent 24%) 0 0/12px 12px, ${bg.bg}`,
    stripes: `repeating-linear-gradient(90deg, ${c} 0 4px, ${bg.bg} 4px 8px)`,
    grid: `linear-gradient(${c} 1px, transparent 1px) 0 0/8px 8px, linear-gradient(90deg, ${c} 1px, transparent 1px) 0 0/8px 8px, ${bg.bg}`,
    checks: `repeating-linear-gradient(0deg, ${c}88 0 6px, transparent 6px 12px), repeating-linear-gradient(90deg, ${c}88 0 6px, transparent 6px 12px), ${bg.bg}`,
    confetti: `radial-gradient(${c} 15%, transparent 17%) 0 0/9px 11px, ${bg.bg}`,
    hearts: `radial-gradient(${c} 20%, transparent 22%) 0 0/10px 10px, ${bg.bg}`,
    linen: `repeating-linear-gradient(0deg, ${c}22 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${c}22 0 1px, transparent 1px 3px), ${bg.bg}`,
  };
  return <span className="block h-full w-full" style={{ background: css[bg.pattern] }} />;
}

export default function BackgroundPanel({ ed }: { ed: EditorApi }) {
  const [all, setAll] = useState(false);
  const bg = ed.page.background;

  const apply = (b: Background, key?: string) => {
    if (all) ed.updateDoc((d) => ({ ...d, pages: d.pages.map((p) => ({ ...p, background: b })) }), key);
    else ed.updatePage((p) => ({ ...p, background: b }), key);
  };

  const patternColor = bg.type === "pattern" ? bg.color : "#e8c9c0";
  const patternBg = bg.type === "pattern" ? bg.bg : bg.type === "color" ? bg.color : "#ffffff";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-paper p-3">
        <Toggle label="Apply to all pages" checked={all} onChange={setAll} />
      </div>
      <section>
        <h3 className="panel-title">Solid color</h3>
        <ColorPicker value={bg.type === "color" ? bg.color : ""} onChange={(c) => apply({ type: "color", color: c }, "bg-color")} />
      </section>
      <section>
        <h3 className="panel-title">Gradients</h3>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENTS.map((g, i) => (
            <button key={i} onClick={() => apply({ type: "gradient", ...g })} className="aspect-square rounded-lg border border-black/10" style={{ background: bgCss({ type: "gradient", ...g }) }} aria-label="Gradient" />
          ))}
        </div>
      </section>
      <section>
        <h3 className="panel-title">Patterns</h3>
        <div className="grid grid-cols-4 gap-2">
          {PATTERNS.map((p) => {
            const b: Background = { type: "pattern", pattern: p.id, color: patternColor, bg: patternBg };
            return (
              <button
                key={p.id}
                title={p.name}
                onClick={() => apply(b)}
                className={`aspect-square overflow-hidden rounded-lg border ${bg.type === "pattern" && bg.pattern === p.id ? "ring-2 ring-accent" : "border-black/10"}`}
              >
                <PatternSwatch bg={b} />
              </button>
            );
          })}
        </div>
        {bg.type === "pattern" && (
          <div className="mt-4 space-y-3">
            <ColorPicker label="Pattern color" value={bg.color} onChange={(c) => apply({ ...bg, color: c }, "bg-pc")} />
            <ColorPicker label="Paper color" value={bg.bg} onChange={(c) => apply({ ...bg, bg: c }, "bg-pb")} />
          </div>
        )}
      </section>
    </div>
  );
}
