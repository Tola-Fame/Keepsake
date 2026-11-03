import type { Background, PatternId } from "./types";

export const PATTERNS: { id: PatternId; name: string }[] = [
  { id: "dots", name: "Polka dots" },
  { id: "stripes", name: "Stripes" },
  { id: "grid", name: "Grid" },
  { id: "checks", name: "Gingham" },
  { id: "confetti", name: "Confetti" },
  { id: "hearts", name: "Hearts" },
  { id: "linen", name: "Linen" },
];

export const SWATCHES = [
  "#ffffff", "#faf7f2", "#f5efe6", "#efe4d2", "#e8d5b7", "#f8e1e4", "#f9d5c9", "#fde9c8",
  "#fff6bf", "#e3f1df", "#d4ebe6", "#dcebf7", "#e3e0f3", "#d9d9d9", "#8a8a8a", "#2b2b2b",
  "#1f1b16", "#0f2a44", "#1a3d2f", "#5a1e2a", "#c2593b", "#d4a017", "#2f7a78", "#6b4c9a",
];

export const GRADIENTS: { from: string; to: string; angle: number }[] = [
  { from: "#fde2e4", to: "#fad2e1", angle: 135 },
  { from: "#fff1c1", to: "#ffd6a5", angle: 135 },
  { from: "#cdeffd", to: "#e2f0cb", angle: 160 },
  { from: "#e0c3fc", to: "#8ec5fc", angle: 135 },
  { from: "#fbe9d7", to: "#f6d5c3", angle: 180 },
  { from: "#0f2a44", to: "#1f4e79", angle: 180 },
  { from: "#2b1b17", to: "#5a3b2e", angle: 180 },
  { from: "#ffecd2", to: "#fcb69f", angle: 135 },
];

/** A representative solid color (used for album cover cards). */
export function bgSolid(bg: Background) {
  if (bg.type === "color") return bg.color;
  if (bg.type === "gradient") return bg.from;
  return bg.bg;
}

/** CSS equivalent of a background, for small previews in the UI. */
export function bgCss(bg: Background): string {
  if (bg.type === "color") return bg.color;
  if (bg.type === "gradient") return `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  return bg.bg;
}

const TILE = 40; // tile size in page units
const RES = 4; // tile drawn at 4× for crisp print output

const tileCache = new Map<string, HTMLCanvasElement>();

/** Builds a repeating tile for pattern backgrounds. Drawn at RES× page-unit resolution. */
export function patternTile(pattern: PatternId, color: string, bg: string): HTMLCanvasElement {
  const key = `${pattern}|${color}|${bg}`;
  const cached = tileCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = c.height = TILE * RES;
  const ctx = c.getContext("2d")!;
  ctx.scale(RES, RES);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  switch (pattern) {
    case "dots":
      for (const [x, y] of [[10, 10], [30, 30]]) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "stripes":
      ctx.fillRect(0, 0, 10, TILE);
      ctx.fillRect(20, 0, 10, TILE);
      break;
    case "grid":
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0.4);
      ctx.lineTo(TILE, 0.4);
      ctx.moveTo(0.4, 0);
      ctx.lineTo(0.4, TILE);
      ctx.moveTo(0, 20.4);
      ctx.lineTo(TILE, 20.4);
      ctx.moveTo(20.4, 0);
      ctx.lineTo(20.4, TILE);
      ctx.stroke();
      break;
    case "checks":
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, 20, TILE);
      ctx.fillRect(0, 0, TILE, 20);
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, 20, 20);
      break;
    case "confetti": {
      const bits: [number, number, number][] = [[6, 8, 20], [26, 6, -30], [16, 22, 60], [34, 26, 10], [8, 34, -50], [24, 36, 35]];
      for (const [x, y, r] of bits) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((r * Math.PI) / 180);
        ctx.fillRect(-3, -1.2, 6, 2.4);
        ctx.restore();
      }
      break;
    }
    case "hearts":
      for (const [x, y] of [[10, 10], [30, 30]]) {
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.bezierCurveTo(x - 6, y, x - 4, y - 5, x, y - 2);
        ctx.bezierCurveTo(x + 4, y - 5, x + 6, y, x, y + 4);
        ctx.fill();
      }
      break;
    case "linen":
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < TILE; i += 2.5) {
        ctx.beginPath();
        ctx.moveTo(0, i + ((i * 7) % 3) * 0.2);
        ctx.lineTo(TILE, i);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + ((i * 5) % 3) * 0.2, TILE);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
  }
  tileCache.set(key, c);
  return c;
}

export const PATTERN_TILE_SCALE = 1 / RES;
