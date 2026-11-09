"use client";

import { useEffect, useRef, useState } from "react";

/** A curvy stem that draws itself when scrolled into view and ends in a bloom. Decorative. */
export default function GrowingStem({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`growing-stem ${on ? "is-on" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 1000 90" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="stem-grad" x1="0" x2="1">
            <stop offset="0" stopColor="#ff9a3c" />
            <stop offset=".5" stopColor="#ff4f9a" />
            <stop offset="1" stopColor="#7bd88f" />
          </linearGradient>
        </defs>
        <path pathLength={1} d="M10 70C120 10 220 10 320 50s200 40 300-10 220-60 360 10" fill="none" stroke="url(#stem-grad)" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="growing-stem-bloom">
        <svg viewBox="0 0 40 40" width="40" height="40">
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return <circle key={i} cx={20 + Math.cos(a) * 9} cy={20 + Math.sin(a) * 9} r="7" fill={i % 2 ? "#ff6fae" : "#ff4f9a"} />;
          })}
          <circle cx="20" cy="20" r="6" fill="#ffe45c" />
        </svg>
      </span>
    </div>
  );
}
