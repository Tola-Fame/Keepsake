"use client";

import { STICKERS, stickerDataUrl } from "@/lib/stickers";
import { newShapeEl, newStickerEl } from "@/lib/doc";
import { templateById } from "@/lib/templates";
import type { EditorApi } from "../api";

export default function StickersPanel({ ed }: { ed: EditorApi }) {
  const theme = templateById(ed.doc.templateId).theme;
  const min = Math.min(ed.pageW, ed.pageH);
  const size = Math.round(min * 0.18);
  const center = { x: Math.round((ed.pageW - size) / 2), y: Math.round((ed.pageH - size) / 2) };
  const suggested = new Set(theme.stickers);
  const sorted = [...STICKERS].sort((a, b) => Number(suggested.has(b.id)) - Number(suggested.has(a.id)));

  return (
    <div className="space-y-6">
      <section>
        <h3 className="panel-title">Stickers</h3>
        <div className="grid grid-cols-4 gap-2">
          {sorted.map((s) => (
            <button
              key={s.id}
              title={s.name}
              onClick={() => ed.addElement(newStickerEl(s.id, s.defaultColor, { ...center, width: size, height: size, rotation: 0 }))}
              className="aspect-square rounded-lg border border-line bg-white p-1.5 transition hover:border-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stickerDataUrl(s.id, s.defaultColor)} alt={s.name} className="h-full w-full" />
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="panel-title">Shapes</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            title="Rectangle"
            onClick={() => ed.addElement(newShapeEl("rect", { ...center, width: size * 1.6, height: size, rotation: 0 }, { fill: theme.accent }))}
            className="flex aspect-square items-center justify-center rounded-lg border border-line bg-white transition hover:border-accent"
          >
            <span className="h-6 w-9 rounded-sm" style={{ background: theme.accent }} />
          </button>
          <button
            title="Rounded box"
            onClick={() => ed.addElement(newShapeEl("rect", { ...center, width: size * 1.6, height: size, rotation: 0 }, { fill: "#ffffff", cornerRadius: size * 0.15, stroke: theme.accent, strokeWidth: 3 }))}
            className="flex aspect-square items-center justify-center rounded-lg border border-line bg-white transition hover:border-accent"
          >
            <span className="h-6 w-9 rounded-md border-2" style={{ borderColor: theme.accent }} />
          </button>
          <button
            title="Circle"
            onClick={() => ed.addElement(newShapeEl("ellipse", { ...center, width: size, height: size, rotation: 0 }, { fill: theme.accent }))}
            className="flex aspect-square items-center justify-center rounded-lg border border-line bg-white transition hover:border-accent"
          >
            <span className="h-8 w-8 rounded-full" style={{ background: theme.accent }} />
          </button>
          <button
            title="Line"
            onClick={() => ed.addElement(newShapeEl("line", { x: Math.round(ed.pageW * 0.3), y: Math.round(ed.pageH / 2), width: Math.round(ed.pageW * 0.4), height: 16, rotation: 0 }, { stroke: theme.accent, strokeWidth: 4 }))}
            className="flex aspect-square items-center justify-center rounded-lg border border-line bg-white transition hover:border-accent"
          >
            <span className="h-0.5 w-9" style={{ background: theme.accent }} />
          </button>
        </div>
      </section>
    </div>
  );
}
