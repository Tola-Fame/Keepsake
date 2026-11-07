"use client";

import { AlignCenter, AlignLeft, AlignRight, ArrowDownToLine, ArrowUpToLine, Bold, ChevronDown, ChevronUp, Copy, ImageOff, Italic, Trash2 } from "lucide-react";
import type { AlbumElement, PhotoEl, ShapeEl, StickerEl, TextEl } from "@/lib/types";
import { FONTS, fontOption } from "@/lib/fonts";
import { rotateAroundCenter } from "@/lib/doc";
import { ColorPicker, IconButton, Slider, Toggle } from "./controls";
import type { EditorApi } from "./api";

type Arrange = "front" | "forward" | "backward" | "back";

export interface PropertiesProps {
  ed: EditorApi;
  el: AlbumElement;
  onDelete: () => void;
  onDuplicate: () => void;
  onArrange: (a: Arrange) => void;
}

const FILTER_PRESETS = [
  { id: "none", label: "Original", f: { grayscale: false, sepia: false, brightness: 0, contrast: 0 } },
  { id: "bw", label: "B & W", f: { grayscale: true, sepia: false, brightness: 0, contrast: 10 } },
  { id: "sepia", label: "Sepia", f: { grayscale: false, sepia: true, brightness: 0, contrast: 0 } },
  { id: "bright", label: "Bright", f: { grayscale: false, sepia: false, brightness: 0.1, contrast: 10 } },
  { id: "moody", label: "Moody", f: { grayscale: false, sepia: false, brightness: -0.08, contrast: 25 } },
];

function PhotoProps({ ed, el }: { ed: EditorApi; el: PhotoEl }) {
  const up = (patch: Partial<PhotoEl>, key?: string) => ed.updateElement(el.id, patch, key);
  const photo = el.photoId ? ed.photoMap[el.photoId] : null;
  return (
    <div className="space-y-5">
      {!photo ? (
        <p className="rounded-lg bg-paper p-3 text-sm text-muted">This is an empty photo spot. Tap a photo in the Photos tab, or drag one here.</p>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="panel-title">Crop</h3>
            <Slider label="Zoom" value={el.zoom} min={1} max={3} step={0.01} onChange={(v) => up({ zoom: v }, `zoom-${el.id}`)} format={(v) => `${Math.round(v * 100)}%`} />
            <Slider label="Left / right" value={el.focusX} min={0} max={1} step={0.01} onChange={(v) => up({ focusX: v }, `fx-${el.id}`)} format={(v) => `${Math.round(v * 100)}%`} />
            <Slider label="Up / down" value={el.focusY} min={0} max={1} step={0.01} onChange={(v) => up({ focusY: v }, `fy-${el.id}`)} format={(v) => `${Math.round(v * 100)}%`} />
          </section>
          <section className="space-y-3">
            <h3 className="panel-title">Filters</h3>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_PRESETS.map((p) => {
                const active = JSON.stringify(p.f) === JSON.stringify(el.filters);
                return (
                  <button key={p.id} onClick={() => up({ filters: p.f })} className={`rounded-full border px-3 py-2 text-xs pointer-fine:py-1 ${active ? "border-accent bg-accent-soft text-accent-dark" : "border-line hover:border-ink/30"}`}>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <Slider label="Brightness" value={el.filters.brightness} min={-0.5} max={0.5} step={0.01} onChange={(v) => up({ filters: { ...el.filters, brightness: v } }, `br-${el.id}`)} format={(v) => `${Math.round(v * 200)}`} />
            <Slider label="Contrast" value={el.filters.contrast} min={-50} max={50} step={1} onChange={(v) => up({ filters: { ...el.filters, contrast: v } }, `ct-${el.id}`)} />
            <Toggle label="Black & white" checked={el.filters.grayscale} onChange={(v) => up({ filters: { ...el.filters, grayscale: v } })} />
            <Toggle label="Sepia" checked={el.filters.sepia} onChange={(v) => up({ filters: { ...el.filters, sepia: v } })} />
          </section>
        </>
      )}
      <section className="space-y-3">
        <h3 className="panel-title">Frame</h3>
        <Slider label="Border" value={el.borderWidth} min={0} max={40} onChange={(v) => up({ borderWidth: v }, `bw-${el.id}`)} />
        {el.borderWidth > 0 && <ColorPicker label="Border color" value={el.borderColor} onChange={(c) => up({ borderColor: c }, `bc-${el.id}`)} />}
        <Slider label="Rounded corners" value={el.cornerRadius} min={0} max={Math.round(Math.min(el.width, el.height) / 2)} onChange={(v) => up({ cornerRadius: v }, `cr-${el.id}`)} />
        <Toggle label="Shadow" checked={el.shadow} onChange={(v) => up({ shadow: v })} />
      </section>
      {photo && (
        <button className="btn-secondary w-full" onClick={() => up({ photoId: null })}>
          <ImageOff className="h-4 w-4" aria-hidden /> Remove photo from this spot
        </button>
      )}
    </div>
  );
}

function TextProps({ ed, el }: { ed: EditorApi; el: TextEl }) {
  const up = (patch: Partial<TextEl>, key?: string) => ed.updateElement(el.id, patch, key);
  const opt = fontOption(el.fontFamily);
  const bold = el.fontStyle.includes("bold");
  const italic = el.fontStyle.includes("italic");
  const style = (b: boolean, i: boolean): TextEl["fontStyle"] => (b && i ? "italic bold" : b ? "bold" : i ? "italic" : "normal");
  return (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor="text-content">Text</label>
        <textarea id="text-content" className="input min-h-20" value={el.text} onChange={(e) => up({ text: e.target.value }, `txt-${el.id}`)} />
        <p className="mt-1 text-xs text-muted">Tip: double-click text on the page to type directly.</p>
      </div>
      <div>
        <label className="label" htmlFor="font">Font</label>
        <select id="font" className="input" value={el.fontFamily} onChange={(e) => up({ fontFamily: e.target.value })} style={{ fontFamily: el.fontFamily }}>
          {FONTS.map((f) => (
            <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <Slider label="Size" value={el.fontSize} min={8} max={240} onChange={(v) => up({ fontSize: v }, `fs-${el.id}`)} />
      <div className="flex flex-wrap items-center gap-1">
        <IconButton label="Bold" active={bold} disabled={!opt.bold} onClick={() => up({ fontStyle: style(!bold, italic) })}>
          <Bold className="h-4 w-4" />
        </IconButton>
        <IconButton label="Italic" active={italic} disabled={!opt.italic} onClick={() => up({ fontStyle: style(bold, !italic) })}>
          <Italic className="h-4 w-4" />
        </IconButton>
        <span className="mx-1 h-6 w-px bg-line" />
        <IconButton label="Align left" active={el.align === "left"} onClick={() => up({ align: "left" })}>
          <AlignLeft className="h-4 w-4" />
        </IconButton>
        <IconButton label="Align center" active={el.align === "center"} onClick={() => up({ align: "center" })}>
          <AlignCenter className="h-4 w-4" />
        </IconButton>
        <IconButton label="Align right" active={el.align === "right"} onClick={() => up({ align: "right" })}>
          <AlignRight className="h-4 w-4" />
        </IconButton>
      </div>
      <ColorPicker label="Color" value={el.fill} onChange={(c) => up({ fill: c }, `fill-${el.id}`)} />
      <Slider label="Line spacing" value={el.lineHeight} min={0.8} max={2.5} step={0.05} onChange={(v) => up({ lineHeight: v }, `lh-${el.id}`)} />
      <Slider label="Letter spacing" value={el.letterSpacing} min={-2} max={20} step={0.5} onChange={(v) => up({ letterSpacing: v }, `ls-${el.id}`)} />
    </div>
  );
}

function StickerProps({ ed, el }: { ed: EditorApi; el: StickerEl }) {
  return <ColorPicker label="Color" value={el.color} onChange={(c) => ed.updateElement(el.id, { color: c }, `sc-${el.id}`)} />;
}

function ShapeProps({ ed, el }: { ed: EditorApi; el: ShapeEl }) {
  const up = (patch: Partial<ShapeEl>, key?: string) => ed.updateElement(el.id, patch, key);
  return (
    <div className="space-y-5">
      {el.shape !== "line" && <ColorPicker label="Fill" value={el.fill} onChange={(c) => up({ fill: c }, `sf-${el.id}`)} allowTransparent />}
      <ColorPicker label={el.shape === "line" ? "Line color" : "Outline"} value={el.stroke} onChange={(c) => up({ stroke: c }, `ss-${el.id}`)} allowTransparent={el.shape !== "line"} />
      <Slider label={el.shape === "line" ? "Thickness" : "Outline width"} value={el.strokeWidth} min={0} max={30} onChange={(v) => up({ strokeWidth: v }, `sw-${el.id}`)} />
      {el.shape === "rect" && <Slider label="Rounded corners" value={el.cornerRadius} min={0} max={Math.round(Math.min(el.width, el.height) / 2)} onChange={(v) => up({ cornerRadius: v }, `scr-${el.id}`)} />}
    </div>
  );
}

const TITLES: Record<AlbumElement["type"], string> = { photo: "Photo", text: "Text", sticker: "Sticker", shape: "Shape" };

export default function Properties({ ed, el, onDelete, onDuplicate, onArrange }: PropertiesProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{TITLES[el.type]}</h2>
        <div className="flex">
          <IconButton label="Duplicate" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </IconButton>
        </div>
      </div>
      {el.type === "photo" && <PhotoProps ed={ed} el={el} />}
      {el.type === "text" && <TextProps ed={ed} el={el} />}
      {el.type === "sticker" && <StickerProps ed={ed} el={el} />}
      {el.type === "shape" && <ShapeProps ed={ed} el={el} />}
      <section className="space-y-3 border-t border-line pt-4">
        <h3 className="panel-title">Arrange</h3>
        <div className="flex gap-1">
          <IconButton label="Bring to front" onClick={() => onArrange("front")}>
            <ArrowUpToLine className="h-4 w-4" />
          </IconButton>
          <IconButton label="Bring forward" onClick={() => onArrange("forward")}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Send backward" onClick={() => onArrange("backward")}>
            <ChevronDown className="h-4 w-4" />
          </IconButton>
          <IconButton label="Send to back" onClick={() => onArrange("back")}>
            <ArrowDownToLine className="h-4 w-4" />
          </IconButton>
        </div>
        <Slider label="Rotation" value={Math.round(el.rotation)} min={-180} max={180} onChange={(v) => ed.updateElement(el.id, rotateAroundCenter(el, v), `rot-${el.id}`)} format={(v) => `${v}°`} />
        <Slider label="Transparency" value={Math.round((1 - (el.opacity ?? 1)) * 100)} min={0} max={90} onChange={(v) => ed.updateElement(el.id, { opacity: 1 - v / 100 }, `op-${el.id}`)} format={(v) => `${v}%`} />
      </section>
    </div>
  );
}
