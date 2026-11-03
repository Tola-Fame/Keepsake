import type { PageSizeId } from "./types";

export const UNITS_PER_INCH = 100;
/** Export pixel ratio: 100 units/inch × 3 = 300 DPI. */
export const PRINT_PIXEL_RATIO = 3;

export interface PageSize {
  id: PageSizeId;
  label: string;
  description: string;
  width: number; // page units
  height: number;
}

export const PAGE_SIZES: Record<PageSizeId, PageSize> = {
  "8x8": { id: "8x8", label: '8 × 8 in', description: "Square, classic photo book", width: 800, height: 800 },
  "10x10": { id: "10x10", label: '10 × 10 in', description: "Large square", width: 1000, height: 1000 },
  "12x12": { id: "12x12", label: '12 × 12 in', description: "Scrapbook square", width: 1200, height: 1200 },
  "11x8.5": { id: "11x8.5", label: 'Letter landscape', description: "11 × 8.5 in, prints at home", width: 1100, height: 850 },
  "8.5x11": { id: "8.5x11", label: 'Letter portrait', description: "8.5 × 11 in, prints at home", width: 850, height: 1100 },
  a4: { id: "a4", label: "A4 portrait", description: "210 × 297 mm, prints at home", width: 827, height: 1169 },
  "a4-land": { id: "a4-land", label: "A4 landscape", description: "297 × 210 mm, prints at home", width: 1169, height: 827 },
};

export const PAGE_SIZE_LIST = Object.values(PAGE_SIZES);

export function pageDims(size: PageSizeId) {
  const s = PAGE_SIZES[size] ?? PAGE_SIZES["8x8"];
  return { w: s.width, h: s.height };
}
