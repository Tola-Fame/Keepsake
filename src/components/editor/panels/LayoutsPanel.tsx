"use client";

import { LAYOUTS, layoutSlots } from "@/lib/layouts";
import { applyLayout } from "@/lib/doc";
import { TEMPLATES, applyTheme, templateById } from "@/lib/templates";
import { bgCss } from "@/lib/backgrounds";
import type { EditorApi } from "../api";

function LayoutIcon({ layoutId, w, h }: { layoutId: string; w: number; h: number }) {
  const layout = LAYOUTS.find((l) => l.id === layoutId)!;
  const { slots, caption } = layoutSlots(layout, w, h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <rect width={w} height={h} fill="#fff" />
      {slots.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.width} height={s.height} fill="#d9cfc0" transform={`rotate(${s.rotation} ${s.x} ${s.y})`} />
      ))}
      {caption && <rect x={caption.x + caption.width * 0.2} y={caption.y + caption.height * 0.3} width={caption.width * 0.6} height={Math.max(8, caption.height * 0.25)} rx={4} fill="#b9ae9c" />}
    </svg>
  );
}

export default function LayoutsPanel({ ed }: { ed: EditorApi }) {
  const theme = templateById(ed.doc.templateId).theme;
  return (
    <div className="space-y-6">
      <section>
        <h3 className="panel-title">Page layout</h3>
        <p className="-mt-2 mb-3 text-xs text-muted">Changes the photo arrangement on page {ed.pageIndex + 1}. Your photos move into the new spots.</p>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              title={l.name}
              onClick={() =>
                ed.updatePage((p) => applyLayout(p, l.id, ed.doc, { fontFamily: theme.body, fill: theme.text, fontSize: Math.round(Math.min(ed.pageW, ed.pageH) * 0.045) }))
              }
              className="overflow-hidden rounded-md border border-line p-1 transition hover:border-accent"
              style={{ aspectRatio: `${ed.pageW} / ${ed.pageH}` }}
            >
              <LayoutIcon layoutId={l.id} w={ed.pageW} h={ed.pageH} />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="panel-title">Album style</h3>
        <p className="-mt-2 mb-3 text-xs text-muted">Changes colors, fonts and photo frames on every page. Your photos and words stay.</p>
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (confirm(`Apply the "${t.name}" style to every page?`)) ed.updateDoc((d) => applyTheme(d, t.id));
              }}
              className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition hover:border-accent ${ed.doc.templateId === t.id ? "border-accent bg-accent-soft/50" : "border-line"}`}
            >
              <span className="h-10 w-10 shrink-0 rounded border border-black/10" style={{ background: bgCss(t.theme.background) }}>
                <span className="flex h-full items-center justify-center text-lg" style={{ fontFamily: t.theme.heading, color: t.theme.text }}>
                  Aa
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block truncate text-xs text-muted">{t.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
