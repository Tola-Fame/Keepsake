import { stickerDataUrl } from "@/lib/stickers";

/** Keepsakes (stickers and photo prints) floating with soft shadows beneath. Decorative. */
type Item = { x: number; y: number; size: number; r: number; delay: number; sticker?: [string, string]; photo?: number };

const SIDE: Item[] = [
  { x: 8, y: 14, size: 96, r: -8, delay: 0, sticker: ["camera", "#3d6bff"] },
  { x: 20, y: 40, size: 120, r: 6, delay: -1.2, photo: 1 },
  { x: 7, y: 66, size: 84, r: 10, delay: -2.4, sticker: ["palm", "#2e7d32"] },
  { x: 22, y: 84, size: 70, r: -12, delay: -3.1, sticker: ["heart", "#ff6fae"] },
  { x: 90, y: 12, size: 82, r: 12, delay: -0.6, sticker: ["airplane", "#1e88e5"] },
  { x: 78, y: 36, size: 128, r: -6, delay: -1.8, photo: 2 },
  { x: 92, y: 60, size: 90, r: -10, delay: -2.9, sticker: ["map-pin", "#e53935"] },
  { x: 79, y: 82, size: 80, r: 8, delay: -3.6, sticker: ["sun", "#ffb300"] },
];

const TOP: Item[] = [
  { x: 0, y: 0, size: 52, r: -10, delay: 0, sticker: ["camera", "#3d6bff"] },
  { x: 0, y: 0, size: 64, r: 6, delay: -1.3, photo: 1 },
  { x: 0, y: 0, size: 48, r: 12, delay: -2.6, sticker: ["airplane", "#1e88e5"] },
  { x: 0, y: 0, size: 50, r: -6, delay: -3.4, sticker: ["map-pin", "#e53935"] },
];

function Thing({ it, style }: { it: Item; style?: React.CSSProperties }) {
  const src = it.sticker ? stickerDataUrl(it.sticker[0], it.sticker[1], true) : `/brand/ribbon/${String(it.photo).padStart(2, "0")}.jpg`;
  return (
    <span className="float-keepsake" style={{ ...style, animationDelay: `${it.delay}s`, ["--r" as string]: `${it.r}deg` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={it.size}
        style={{ width: it.size, ...(it.photo ? { aspectRatio: "4 / 3", objectFit: "cover", border: "6px solid #fff", borderRadius: 6, boxShadow: "0 10px 24px -14px rgba(46,43,48,.5)" } : {}) }}
      />
    </span>
  );
}

export function FloatingKeepsakesSides() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden>
      {SIDE.map((it, i) => (
        <Thing key={i} it={it} style={{ left: `${it.x}%`, top: `${it.y}%`, transform: "translate(-50%, -50%)" }} />
      ))}
    </div>
  );
}

export function FloatingKeepsakesTop() {
  return (
    <div className="pointer-events-none mb-4 flex items-end justify-center gap-5 lg:hidden" aria-hidden>
      {TOP.map((it, i) => (
        <Thing key={i} it={it} style={{ position: "relative" }} />
      ))}
    </div>
  );
}
