// Fonts are self-hosted through @fontsource (imported in globals.css),
// so they work in the editor, in PDFs and in print without external requests.

export interface FontOption {
  family: string;
  label: string;
  category: "serif" | "sans" | "script" | "display";
  bold: boolean;
  italic: boolean;
}

export const FONTS: FontOption[] = [
  { family: "Playfair Display", label: "Playfair Display", category: "serif", bold: true, italic: true },
  { family: "Cormorant Garamond", label: "Cormorant Garamond", category: "serif", bold: true, italic: true },
  { family: "Lora", label: "Lora", category: "serif", bold: true, italic: true },
  { family: "Inter", label: "Inter", category: "sans", bold: true, italic: true },
  { family: "Montserrat", label: "Montserrat", category: "sans", bold: true, italic: true },
  { family: "Bebas Neue", label: "Bebas Neue", category: "display", bold: false, italic: false },
  { family: "Amatic SC", label: "Amatic SC", category: "display", bold: true, italic: false },
  { family: "Great Vibes", label: "Great Vibes", category: "script", bold: false, italic: false },
  { family: "Dancing Script", label: "Dancing Script", category: "script", bold: true, italic: false },
  { family: "Pacifico", label: "Pacifico", category: "script", bold: false, italic: false },
  { family: "Caveat", label: "Caveat", category: "script", bold: true, italic: false },
];

export function fontOption(family: string) {
  return FONTS.find((f) => f.family === family) ?? FONTS[3];
}

const loaded = new Set<string>();

/** Make sure the given font faces are downloaded before drawing on canvas. */
export async function ensureFonts(specs: { family: string; style: string }[]) {
  if (typeof document === "undefined" || !document.fonts) return;
  const jobs: Promise<unknown>[] = [];
  for (const { family, style } of specs) {
    const opt = fontOption(family);
    const bold = style.includes("bold") && opt.bold;
    const italic = style.includes("italic") && opt.italic;
    const key = `${family}|${bold}|${italic}`;
    if (loaded.has(key)) continue;
    const css = `${italic ? "italic " : ""}${bold ? "700 " : "400 "}40px "${family}"`;
    jobs.push(
      document.fonts
        .load(css)
        .then(() => loaded.add(key))
        .catch(() => undefined),
    );
  }
  if (jobs.length) await Promise.all(jobs);
}
