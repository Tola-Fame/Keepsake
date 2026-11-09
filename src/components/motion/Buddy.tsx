/**
 * Keepsake "travel buddy": a little character that hops between travel shapes
 * (window, cloud, sun, suitcase, map pin) and blinks. Used while things load.
 */
const SHAPES: { color: string; node: React.ReactNode }[] = [
  { color: "#ff6fae", node: <rect x="24" y="12" width="52" height="74" rx="25" /> },
  { color: "#8fd0ff", node: <path d="M28 76a18 18 0 0 1-2-36 22 22 0 0 1 42-6 16 16 0 0 1 8 42z" /> },
  {
    color: "#ffb547",
    node: (
      <>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <circle key={i} cx={50 + Math.cos(a) * 24} cy={52 + Math.sin(a) * 24} r="15" />;
        })}
        <circle cx="50" cy="52" r="26" />
      </>
    ),
  },
  {
    color: "#ff8a3d",
    node: (
      <>
        <path d="M38 30v-7a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v7" fill="none" stroke="#ff8a3d" strokeWidth="7" />
        <rect x="16" y="28" width="68" height="56" rx="14" />
      </>
    ),
  },
  { color: "#7bd88f", node: <path d="M50 92C34 72 22 60 22 42a28 28 0 0 1 56 0c0 18-12 30-28 50z" /> },
];

export default function Buddy({ size = 72, label, className = "" }: { size?: number; label?: string; className?: string }) {
  return (
    <span className={`buddy ${className}`} style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {SHAPES.map((s, i) => (
          <g key={i} className="buddy-shape" fill={s.color} style={{ animationDelay: `${i * 1.2}s` }}>
            {s.node}
          </g>
        ))}
        <g className="buddy-eyes" fill="#fff">
          <rect x="39" y="42" width="7" height="16" rx="3.5" />
          <rect x="54" y="42" width="7" height="16" rx="3.5" />
        </g>
      </svg>
    </span>
  );
}
