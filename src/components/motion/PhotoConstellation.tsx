import { stickerDataUrl } from "@/lib/stickers";

/** Trip photos and stickers floating around the drop area. Decorative. */
type Tile = { x: number; y: number; w: number; r: number; depth: number; src: string; sticker?: boolean; wide?: boolean };

const P = (n: number) => `/brand/ribbon/${String(n).padStart(2, "0")}.jpg`;
const S = (id: string, color: string) => stickerDataUrl(id, color, true);

// x/y are % of the box (centre of tile); depth 1 = near (bigger, sharper), 0 = far
const TILES: Tile[] = [
  { x: 9, y: 16, w: 74, r: -8, depth: 0.9, src: P(1) },
  { x: 25, y: 7, w: 46, r: 6, depth: 0.4, src: P(7) },
  { x: 42, y: 10, w: 40, r: -4, depth: 0.2, src: S("star", "#ffe45c"), sticker: true },
  { x: 60, y: 7, w: 52, r: 5, depth: 0.5, src: P(4) },
  { x: 80, y: 13, w: 80, r: 9, depth: 1, src: P(2), wide: true },
  { x: 94, y: 34, w: 44, r: -6, depth: 0.3, src: S("airplane", "#8fd0ff"), sticker: true },
  { x: 6, y: 48, w: 48, r: 4, depth: 0.35, src: S("palm", "#2e7d32"), sticker: true },
  { x: 89, y: 62, w: 70, r: -5, depth: 0.85, src: P(5) },
  { x: 12, y: 80, w: 82, r: 7, depth: 1, src: P(3), wide: true },
  { x: 30, y: 92, w: 44, r: -9, depth: 0.3, src: P(10) },
  { x: 50, y: 90, w: 38, r: 8, depth: 0.25, src: S("heart", "#ff6fae"), sticker: true },
  { x: 69, y: 91, w: 50, r: -3, depth: 0.45, src: P(9) },
  { x: 95, y: 88, w: 42, r: 10, depth: 0.35, src: S("camera", "#3d6bff"), sticker: true },
  { x: 24, y: 30, w: 36, r: 12, depth: 0.15, src: P(8) },
  { x: 76, y: 36, w: 34, r: -12, depth: 0.15, src: P(6) },
];

export default function PhotoConstellation() {
  return (
    <div className="constellation" aria-hidden>
      {TILES.map((t, i) => (
        <span
          key={i}
          className={`constellation-tile ${t.sticker ? "is-sticker" : ""} ${i % 3 === 2 ? "hidden sm:block" : ""}`}
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: t.w * (t.wide ? 1.15 : 1),
            opacity: t.sticker ? 1 : 0.45 + t.depth * 0.55,
            filter: !t.sticker && t.depth < 0.3 ? "blur(1.5px)" : undefined,
            zIndex: Math.round(t.depth * 10),
            ["--r" as string]: `${t.r}deg`,
            animationDuration: `${6 + (i % 5)}s`,
            animationDelay: `${-i * 0.7}s`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.src} alt="" loading="lazy" />
        </span>
      ))}
    </div>
  );
}
