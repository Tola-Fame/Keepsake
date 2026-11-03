"use client";
// Procedurally drawn "sample photos" for template previews (no external images needed).
import type { Photo, PhotoMap } from "./types";

type Scene = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function grad(ctx: CanvasRenderingContext2D, h: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

function bokeh(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], n: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const r = 10 + rnd() * 60;
    ctx.globalAlpha = 0.15 + rnd() * 0.35;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(rnd() * w, rnd() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const scenes: Scene[] = [
  // sunset over hills
  (ctx, w, h) => {
    ctx.fillStyle = grad(ctx, h, [[0, "#f7a072"], [0.55, "#fbd5a5"], [1, "#fde9c8"]]);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff4d6";
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.5, h * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9806b";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.quadraticCurveTo(w * 0.3, h * 0.45, w * 0.6, h * 0.64);
    ctx.quadraticCurveTo(w * 0.85, h * 0.75, w, h * 0.6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.fillStyle = "#8f5a52";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.8);
    ctx.quadraticCurveTo(w * 0.5, h * 0.62, w, h * 0.82);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  },
  // beach
  (ctx, w, h) => {
    ctx.fillStyle = grad(ctx, h, [[0, "#7cc6e8"], [0.5, "#c9ecf7"]]);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2f9fb3";
    ctx.fillRect(0, h * 0.5, w, h * 0.18);
    ctx.fillStyle = "#5cc2c9";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.66);
    for (let x = 0; x <= w; x += w / 8) ctx.quadraticCurveTo(x + w / 16, h * 0.62, x + w / 8, h * 0.66);
    ctx.lineTo(w, h * 0.7);
    ctx.lineTo(0, h * 0.7);
    ctx.fill();
    ctx.fillStyle = "#f3dcae";
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.fillStyle = "#fff8e1";
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.2, h * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  // mountains
  (ctx, w, h) => {
    ctx.fillStyle = grad(ctx, h, [[0, "#9ab8d9"], [1, "#e7eef6"]]);
    ctx.fillRect(0, 0, w, h);
    const ridge = (y: number, color: string, peaks: number[]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      peaks.forEach((p, i) => ctx.lineTo((i / (peaks.length - 1)) * w, y - p * h));
      ctx.lineTo(w, h);
      ctx.fill();
    };
    ridge(h * 0.7, "#7a93b3", [0.1, 0.35, 0.15, 0.4, 0.2, 0.3]);
    ridge(h * 0.85, "#4e6886", [0.05, 0.2, 0.32, 0.12, 0.25, 0.1]);
    ridge(h, "#2d4560", [0.1, 0.18, 0.08, 0.2, 0.12, 0.16]);
  },
  // party bokeh
  (ctx, w, h) => {
    ctx.fillStyle = grad(ctx, h, [[0, "#3b1f4a"], [1, "#7b2d5b"]]);
    ctx.fillRect(0, 0, w, h);
    bokeh(ctx, w, h, ["#ffd166", "#ef476f", "#06d6a0", "#ffffff", "#f78c6b"], 40, 7);
  },
  // flowers / garden
  (ctx, w, h) => {
    ctx.fillStyle = grad(ctx, h, [[0, "#f6e7e1"], [1, "#e8c8c0"]]);
    ctx.fillRect(0, 0, w, h);
    bokeh(ctx, w, h, ["#ffffff", "#f1b6c0", "#d9e7c4"], 26, 3);
    for (const [cx, cy, r, c] of [[0.3, 0.55, 0.14, "#e07a8f"], [0.62, 0.45, 0.17, "#f2a5b3"], [0.5, 0.75, 0.11, "#d65f7a"]] as const) {
      ctx.fillStyle = c;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(cx * w + Math.cos(a) * r * h * 0.55, cy * h + Math.sin(a) * r * h * 0.55, r * h * 0.5, r * h * 0.32, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffe08a";
      ctx.beginPath();
      ctx.arc(cx * w, cy * h, r * h * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // city lights
  (ctx, w, h) => {
    ctx.fillStyle = grad(ctx, h, [[0, "#0f2a44"], [1, "#2a4d6e"]]);
    ctx.fillRect(0, 0, w, h);
    bokeh(ctx, w, h * 0.5, ["#ffd27a", "#ffffff"], 18, 11);
    let x = 0;
    let s = 5;
    while (x < w) {
      const bw = w * (0.06 + ((s = (s * 7 + 3) % 11) / 11) * 0.08);
      const bh = h * (0.25 + (s / 11) * 0.4);
      ctx.fillStyle = "#132235";
      ctx.fillRect(x, h - bh, bw - 4, bh);
      ctx.fillStyle = "#ffd27a";
      for (let wy = h - bh + 12; wy < h - 10; wy += 22) for (let wx = x + 8; wx < x + bw - 14; wx += 16) if ((wx + wy) % 3 < 1.5) ctx.fillRect(wx, wy, 6, 9);
      x += bw;
    }
  },
];

let cache: PhotoMap | null = null;

export function samplePhotos(): PhotoMap {
  if (cache) return cache;
  const map: PhotoMap = {};
  scenes.forEach((draw, i) => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 600;
    draw(c.getContext("2d")!, 800, 600);
    const src = c.toDataURL("image/jpeg", 0.85);
    const p: Photo = { id: `sample-${i}`, src, thumb: src, width: 800, height: 600, createdAt: i };
    map[p.id] = p;
  });
  cache = map;
  return map;
}
