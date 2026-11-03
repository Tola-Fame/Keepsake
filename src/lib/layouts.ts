export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

type GridCell = [col: number, row: number, colSpan: number, rowSpan: number];
type FreeCell = { fx: number; fy: number; fw: number; fh: number; rot: number }; // fractions of content box, rotation around center

export interface LayoutDef {
  id: string;
  name: string;
  count: number;
  margin: boolean;
  caption?: boolean;
  grid?: { cols: number; rows: number; cells: GridCell[] };
  free?: FreeCell[];
}

export const LAYOUTS: LayoutDef[] = [
  { id: "full", name: "Full page", count: 1, margin: false, free: [{ fx: 0, fy: 0, fw: 1, fh: 1, rot: 0 }] },
  { id: "single", name: "One photo", count: 1, margin: true, grid: { cols: 1, rows: 1, cells: [[0, 0, 1, 1]] } },
  { id: "single-caption", name: "Photo + caption", count: 1, margin: true, caption: true, grid: { cols: 1, rows: 1, cells: [[0, 0, 1, 1]] } },
  { id: "two-side", name: "Two side by side", count: 2, margin: true, grid: { cols: 2, rows: 1, cells: [[0, 0, 1, 1], [1, 0, 1, 1]] } },
  { id: "two-stack", name: "Two stacked", count: 2, margin: true, grid: { cols: 1, rows: 2, cells: [[0, 0, 1, 1], [0, 1, 1, 1]] } },
  { id: "two-feature", name: "Big + small", count: 2, margin: true, grid: { cols: 3, rows: 1, cells: [[0, 0, 2, 1], [2, 0, 1, 1]] } },
  { id: "three-left", name: "Three, big left", count: 3, margin: true, grid: { cols: 2, rows: 2, cells: [[0, 0, 1, 2], [1, 0, 1, 1], [1, 1, 1, 1]] } },
  { id: "three-top", name: "Three, big top", count: 3, margin: true, grid: { cols: 2, rows: 2, cells: [[0, 0, 2, 1], [0, 1, 1, 1], [1, 1, 1, 1]] } },
  { id: "three-row", name: "Three in a row", count: 3, margin: true, grid: { cols: 3, rows: 1, cells: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1]] } },
  { id: "four-grid", name: "Four grid", count: 4, margin: true, grid: { cols: 2, rows: 2, cells: [[0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1]] } },
  { id: "four-feature", name: "Four, big top", count: 4, margin: true, grid: { cols: 3, rows: 3, cells: [[0, 0, 3, 2], [0, 2, 1, 1], [1, 2, 1, 1], [2, 2, 1, 1]] } },
  { id: "five", name: "Five", count: 5, margin: true, grid: { cols: 4, rows: 2, cells: [[0, 0, 2, 2], [2, 0, 1, 1], [3, 0, 1, 1], [2, 1, 1, 1], [3, 1, 1, 1]] } },
  { id: "six-grid", name: "Six grid", count: 6, margin: true, grid: { cols: 3, rows: 2, cells: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1]] } },
  { id: "six-feature", name: "Six, big corner", count: 6, margin: true, grid: { cols: 3, rows: 3, cells: [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1], [0, 2, 1, 1], [1, 2, 1, 1], [2, 2, 1, 1]] } },
  { id: "nine-grid", name: "Nine grid", count: 9, margin: true, grid: { cols: 3, rows: 3, cells: [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [c, r, 1, 1] as GridCell)) } },
  {
    id: "collage-3",
    name: "Scrapbook three",
    count: 3,
    margin: true,
    free: [
      { fx: 0.02, fy: 0.04, fw: 0.56, fh: 0.48, rot: -4 },
      { fx: 0.44, fy: 0.22, fw: 0.54, fh: 0.44, rot: 5 },
      { fx: 0.08, fy: 0.54, fw: 0.54, fh: 0.42, rot: 3 },
    ],
  },
  {
    id: "collage-4",
    name: "Scrapbook four",
    count: 4,
    margin: true,
    free: [
      { fx: 0.02, fy: 0.03, fw: 0.47, fh: 0.45, rot: -5 },
      { fx: 0.52, fy: 0.05, fw: 0.45, fh: 0.42, rot: 4 },
      { fx: 0.04, fy: 0.52, fw: 0.45, fh: 0.43, rot: 3 },
      { fx: 0.51, fy: 0.52, fw: 0.47, fh: 0.44, rot: -3 },
    ],
  },
];

export function layoutById(id: string) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[1];
}

export function pageMargin(w: number, h: number) {
  return Math.round(Math.min(w, h) * 0.07);
}

/** Converts a center-based rotation to Konva's top-left based position. */
function rotatedTopLeft(cx: number, cy: number, w: number, h: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return { x: cx + (-w / 2) * cos - (-h / 2) * sin, y: cy + (-w / 2) * sin + (-h / 2) * cos };
}

/** Computes photo slot rectangles (and caption box) for a layout on a page of w×h units. */
export function layoutSlots(layout: LayoutDef, w: number, h: number): { slots: Rect[]; caption: Rect | null } {
  const min = Math.min(w, h);
  const m = layout.margin ? pageMargin(w, h) : 0;
  const g = layout.margin ? Math.round(min * 0.025) : 0;
  const captionH = layout.caption ? Math.round(min * 0.13) : 0;
  const x0 = m;
  const y0 = m;
  const cw = w - 2 * m;
  const ch = h - 2 * m - captionH;
  const slots: Rect[] = [];

  if (layout.grid) {
    const { cols, rows, cells } = layout.grid;
    const colW = (cw - g * (cols - 1)) / cols;
    const rowH = (ch - g * (rows - 1)) / rows;
    for (const [c, r, cs, rs] of cells) {
      slots.push({
        x: Math.round(x0 + c * (colW + g)),
        y: Math.round(y0 + r * (rowH + g)),
        width: Math.round(cs * colW + (cs - 1) * g),
        height: Math.round(rs * rowH + (rs - 1) * g),
        rotation: 0,
      });
    }
  } else if (layout.free) {
    for (const f of layout.free) {
      const sw = f.fw * cw;
      const sh = f.fh * ch;
      const cx = x0 + f.fx * cw + sw / 2;
      const cy = y0 + f.fy * ch + sh / 2;
      const p = rotatedTopLeft(cx, cy, sw, sh, f.rot);
      slots.push({ x: Math.round(p.x), y: Math.round(p.y), width: Math.round(sw), height: Math.round(sh), rotation: f.rot });
    }
  }

  const caption = layout.caption
    ? { x: x0, y: Math.round(y0 + ch + min * 0.03), width: cw, height: captionH - Math.round(min * 0.03), rotation: 0 }
    : null;
  return { slots, caption };
}
