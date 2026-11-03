"use client";

import { SWATCHES } from "@/lib/backgrounds";

export function ColorPicker({ value, onChange, label, allowTransparent = false }: { value: string; onChange: (c: string) => void; label?: string; allowTransparent?: boolean }) {
  const isHex = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="flex flex-wrap gap-1.5">
        {allowTransparent && (
          <button
            onClick={() => onChange("transparent")}
            title="None"
            aria-label="No color"
            className={`h-6 w-6 rounded-full border bg-[linear-gradient(45deg,transparent_45%,#e11d48_45%,#e11d48_55%,transparent_55%)] ${value === "transparent" ? "ring-2 ring-accent ring-offset-1" : "border-line"}`}
          />
        )}
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            aria-label={`Color ${c}`}
            className={`h-6 w-6 rounded-full border border-black/10 ${value.toLowerCase() === c ? "ring-2 ring-accent ring-offset-1" : ""}`}
            style={{ background: c }}
          />
        ))}
        <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-black/10 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" title="Custom color">
          <input type="color" value={isHex ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom color" />
        </label>
      </div>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        <span className="font-normal normal-case">{format ? format(value) : value}</span>
      </span>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

export function IconButton({ label, onClick, children, disabled, active }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-35 ${active ? "bg-accent-soft text-accent-dark" : "text-ink hover:bg-black/5"}`}
    >
      {children}
    </button>
  );
}
