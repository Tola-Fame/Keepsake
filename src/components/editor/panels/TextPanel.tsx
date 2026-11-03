"use client";

import { newTextEl } from "@/lib/doc";
import { templateById } from "@/lib/templates";
import { FONTS } from "@/lib/fonts";
import type { TextEl } from "@/lib/types";
import type { EditorApi } from "../api";

export default function TextPanel({ ed }: { ed: EditorApi }) {
  const theme = templateById(ed.doc.templateId).theme;
  const min = Math.min(ed.pageW, ed.pageH);

  const add = (text: string, size: number, props: Partial<TextEl>) => {
    const fontSize = Math.round(min * size);
    const width = Math.round(ed.pageW * 0.7);
    ed.addElement(
      newTextEl({ x: Math.round((ed.pageW - width) / 2), y: Math.round(ed.pageH / 2 - fontSize), width, height: Math.round(fontSize * 1.3), rotation: 0 }, { text, fontSize, fill: theme.text, ...props }),
    );
  };

  const presets = [
    { label: "Add a title", size: 0.09, props: { role: "heading" as const, fontFamily: theme.heading, fontStyle: theme.headingStyle } },
    { label: "Add a subtitle", size: 0.05, props: { role: "heading" as const, fontFamily: theme.heading, fontStyle: theme.headingStyle } },
    { label: "Add a paragraph", size: 0.032, props: { role: "body" as const, fontFamily: theme.body, text: "Write about this moment…" } },
    { label: "Add a caption", size: 0.026, props: { role: "body" as const, fontFamily: theme.body, letterSpacing: 1 } },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="panel-title">Add text</h3>
        {presets.map((p, i) => (
          <button
            key={p.label}
            onClick={() => add(p.props.text ?? p.label.replace("Add a ", "").replace(/^./, (c) => c.toUpperCase()), p.size, p.props)}
            className="block w-full rounded-lg border border-line bg-white px-3 py-3 text-left transition hover:border-accent"
            style={{ fontFamily: p.props.fontFamily, fontSize: [26, 20, 15, 13][i], fontStyle: p.props.fontStyle?.includes("italic") ? "italic" : "normal", fontWeight: p.props.fontStyle?.includes("bold") ? 700 : 400 }}
          >
            {p.label}
          </button>
        ))}
      </section>
      <section>
        <h3 className="panel-title">Fonts</h3>
        <p className="-mt-2 mb-3 text-xs text-muted">Tap to add text in this font.</p>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.family}
              onClick={() => add(f.label, f.category === "script" ? 0.07 : 0.06, { fontFamily: f.family, role: f.category === "sans" || f.category === "serif" ? "body" : "heading" })}
              className="truncate rounded-lg border border-line bg-white px-2 py-2.5 text-lg transition hover:border-accent"
              style={{ fontFamily: f.family }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
