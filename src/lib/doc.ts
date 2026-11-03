import { nanoid } from "nanoid";
import type { AlbumCover, AlbumDoc, AlbumElement, Background, Page, Photo, PhotoEl, ShapeEl, StickerEl, TextEl } from "./types";
import { layoutById, layoutSlots, type Rect } from "./layouts";
import { pageDims } from "./pageSizes";
import { bgSolid } from "./backgrounds";

export const uid = () => nanoid(10);

export interface PhotoStyle {
  borderWidth: number;
  borderColor: string;
  cornerRadius: number;
  shadow: boolean;
}

export const DEFAULT_PHOTO_STYLE: PhotoStyle = { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 0, shadow: false };

export function newPhotoEl(rect: Rect, style: PhotoStyle = DEFAULT_PHOTO_STYLE, photoId: string | null = null): PhotoEl {
  return {
    id: uid(),
    type: "photo",
    ...rect,
    photoId,
    zoom: 1,
    focusX: 0.5,
    focusY: 0.5,
    filters: { grayscale: false, sepia: false, brightness: 0, contrast: 0 },
    ...style,
  };
}

export function newTextEl(rect: Rect, props: Partial<TextEl>): TextEl {
  return {
    id: uid(),
    type: "text",
    ...rect,
    text: "Your text",
    fontFamily: "Inter",
    fontSize: 32,
    fontStyle: "normal",
    fill: "#1f1b16",
    align: "center",
    lineHeight: 1.2,
    letterSpacing: 0,
    ...props,
  };
}

export function newStickerEl(stickerId: string, color: string, rect: Rect): StickerEl {
  return { id: uid(), type: "sticker", stickerId, color, ...rect };
}

export function newShapeEl(shape: ShapeEl["shape"], rect: Rect, props: Partial<ShapeEl> = {}): ShapeEl {
  return {
    id: uid(),
    type: "shape",
    shape,
    ...rect,
    fill: shape === "line" ? "transparent" : "#c2593b",
    stroke: shape === "line" ? "#1f1b16" : "transparent",
    strokeWidth: shape === "line" ? 4 : 0,
    cornerRadius: 0,
    ...props,
  };
}

export function photoStyleOf(page: Page | undefined): PhotoStyle {
  const p = page?.elements.find((e): e is PhotoEl => e.type === "photo");
  if (!p) return DEFAULT_PHOTO_STYLE;
  return { borderWidth: p.borderWidth, borderColor: p.borderColor, cornerRadius: p.cornerRadius, shadow: p.shadow };
}

export interface CaptionStyle {
  fontFamily: string;
  fill: string;
  fontSize?: number;
}

/**
 * Applies a photo layout to a page. Existing photos move into the new slots in order;
 * text, stickers and shapes are kept.
 */
export function applyLayout(page: Page, layoutId: string, doc: AlbumDoc, caption?: CaptionStyle, captionText = "Add a caption"): Page {
  const { w, h } = pageDims(doc.size);
  const layout = layoutById(layoutId);
  const { slots, caption: capRect } = layoutSlots(layout, w, h);
  const style = photoStyleOf(page);
  const oldPhotos = page.elements.filter((e): e is PhotoEl => e.type === "photo");
  const filled = oldPhotos.filter((p) => p.photoId);
  const others = page.elements.filter((e) => e.type !== "photo" && !(e.type === "text" && e.id.startsWith("cap_")));
  const photos = slots.map((rect, i) => {
    const prev = filled[i];
    const el = newPhotoEl(rect, style, prev?.photoId ?? null);
    if (prev) el.filters = { ...prev.filters };
    return el;
  });
  const els: AlbumElement[] = [...photos, ...others];
  if (capRect && caption) {
    const t = newTextEl(capRect, {
      text: captionText,
      role: "body",
      fontFamily: caption.fontFamily,
      fill: caption.fill,
      fontSize: caption.fontSize ?? Math.round(Math.min(w, h) * 0.04),
    });
    t.id = "cap_" + t.id;
    els.push(t);
  }
  return { ...page, elements: els };
}

export function blankPage(background: Background): Page {
  return { id: uid(), background, elements: [] };
}

export function usedPhotoIds(doc: AlbumDoc): Set<string> {
  const s = new Set<string>();
  for (const p of doc.pages) for (const e of p.elements) if (e.type === "photo" && e.photoId) s.add(e.photoId);
  return s;
}

/** Fills empty photo slots across the album with photos that are not used yet. */
export function autoFill(doc: AlbumDoc, photos: Photo[]): { doc: AlbumDoc; placed: number } {
  const used = usedPhotoIds(doc);
  const queue = photos.filter((p) => !used.has(p.id));
  let placed = 0;
  const pages = doc.pages.map((page) => ({
    ...page,
    elements: page.elements.map((e) => {
      if (e.type === "photo" && !e.photoId && queue.length) {
        placed++;
        return { ...e, photoId: queue.shift()!.id, zoom: 1, focusX: 0.5, focusY: 0.5 };
      }
      return e;
    }),
  }));
  return { doc: { ...doc, pages }, placed };
}

export function removePhotoRefs(doc: AlbumDoc, photoId: string): AlbumDoc {
  return {
    ...doc,
    pages: doc.pages.map((p) => ({
      ...p,
      elements: p.elements.map((e) => (e.type === "photo" && e.photoId === photoId ? { ...e, photoId: null } : e)),
    })),
  };
}

export function remapPhotoIds(doc: AlbumDoc, map: Record<string, string>): AlbumDoc {
  return {
    ...doc,
    pages: doc.pages.map((p) => ({
      ...p,
      elements: p.elements.map((e) => (e.type === "photo" && e.photoId && map[e.photoId] ? { ...e, photoId: map[e.photoId] } : e)),
    })),
  };
}

export function docCover(doc: AlbumDoc, photos: Photo[]): AlbumCover {
  const first = doc.pages[0];
  const byId = new Map(photos.map((p) => [p.id, p]));
  let thumb: string | null = null;
  for (const page of doc.pages) {
    for (const e of page.elements) {
      if (e.type === "photo" && e.photoId && byId.get(e.photoId)) {
        thumb = byId.get(e.photoId)!.thumb;
        break;
      }
    }
    if (thumb) break;
  }
  return { thumb, bg: first ? bgSolid(first.background) : "#faf7f2" };
}

export function clonePage(page: Page): Page {
  return { ...structuredClone(page), id: uid(), elements: page.elements.map((e) => ({ ...structuredClone(e), id: uid() })) };
}

/** Fonts used anywhere in a page – used to preload before drawing. */
export function pageFonts(page: Page) {
  return page.elements
    .filter((e): e is TextEl => e.type === "text")
    .map((t) => ({ family: t.fontFamily, style: t.fontStyle }));
}
