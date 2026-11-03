import type { AlbumDoc, AlbumElement, Background, Page, PageSizeId, TextEl } from "./types";
import { pageDims } from "./pageSizes";
import { applyLayout, blankPage, newPhotoEl, newShapeEl, newStickerEl, newTextEl, uid, type PhotoStyle } from "./doc";
import { stickerById } from "./stickers";

export interface Theme {
  background: Background;
  coverBackground?: Background;
  text: string;
  accent: string;
  heading: string;
  headingStyle: TextEl["fontStyle"];
  body: string;
  photo: PhotoStyle;
  stickers: string[];
}

export type CoverStyle = "polaroid" | "framed" | "photo-top" | "full-bleed" | "title-only";

export interface Template {
  id: string;
  name: string;
  occasion: Occasion;
  description: string;
  theme: Theme;
  cover: CoverStyle;
  pages: string[]; // layout ids for inner pages
  phrases: string[]; // used for captions
  titlePlaceholder: string;
  subtitlePlaceholder: string;
}

export type Occasion = "birthday" | "wedding" | "vacation" | "baby" | "graduation" | "anniversary" | "family" | "holiday" | "other";

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "birthday", label: "Birthday" },
  { id: "wedding", label: "Wedding" },
  { id: "vacation", label: "Vacation & travel" },
  { id: "baby", label: "Baby" },
  { id: "graduation", label: "Graduation" },
  { id: "anniversary", label: "Anniversary" },
  { id: "family", label: "Family" },
  { id: "holiday", label: "Holidays" },
  { id: "other", label: "Simple & blank" },
];

export const TEMPLATES: Template[] = [
  {
    id: "confetti-party",
    name: "Confetti Party",
    occasion: "birthday",
    description: "Bright, playful and full of confetti.",
    theme: {
      background: { type: "pattern", pattern: "confetti", color: "#f6c1cb", bg: "#fffaf3" },
      text: "#2b2b2b",
      accent: "#e94f64",
      heading: "Pacifico",
      headingStyle: "normal",
      body: "Montserrat",
      photo: { borderWidth: 12, borderColor: "#ffffff", cornerRadius: 0, shadow: true },
      stickers: ["balloon", "confetti", "party-hat", "cake", "star"],
    },
    cover: "polaroid",
    pages: ["two-side", "single-caption", "three-left", "four-grid", "collage-3", "single-caption"],
    phrases: ["Make a wish!", "Best day ever", "Another trip around the sun", "Let's celebrate"],
    titlePlaceholder: "Happy Birthday!",
    subtitlePlaceholder: "Turning 30",
  },
  {
    id: "big-day",
    name: "Big Day",
    occasion: "birthday",
    description: "Bold letters on a warm sunset gradient.",
    theme: {
      background: { type: "gradient", from: "#fff1c1", to: "#ffd6a5", angle: 135 },
      text: "#3a2410",
      accent: "#e67e22",
      heading: "Bebas Neue",
      headingStyle: "normal",
      body: "Montserrat",
      photo: { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 18, shadow: false },
      stickers: ["star", "gift", "sparkle"],
    },
    cover: "photo-top",
    pages: ["three-top", "two-feature", "four-feature", "single-caption", "six-grid"],
    phrases: ["Cheers to you", "The party", "Good times", "Celebrate"],
    titlePlaceholder: "HAPPY BIRTHDAY",
    subtitlePlaceholder: "A day to remember",
  },
  {
    id: "ivory-gold",
    name: "Ivory & Gold",
    occasion: "wedding",
    description: "Classic and elegant with script lettering.",
    theme: {
      background: { type: "color", color: "#faf6ef" },
      text: "#3d3326",
      accent: "#c9a227",
      heading: "Great Vibes",
      headingStyle: "normal",
      body: "Cormorant Garamond",
      photo: { borderWidth: 3, borderColor: "#c9a227", cornerRadius: 0, shadow: false },
      stickers: ["branch", "rings", "sparkle"],
    },
    cover: "framed",
    pages: ["single-caption", "two-side", "three-left", "single", "four-grid", "two-stack", "single-caption"],
    phrases: ["Forever begins today", "Two hearts, one love", "The vows", "Our first dance", "Happily ever after"],
    titlePlaceholder: "Emma & James",
    subtitlePlaceholder: "June 14, 2026",
  },
  {
    id: "modern-romance",
    name: "Modern Romance",
    occasion: "wedding",
    description: "Clean white pages and refined serif type.",
    theme: {
      background: { type: "color", color: "#ffffff" },
      text: "#1f1b16",
      accent: "#b08968",
      heading: "Playfair Display",
      headingStyle: "italic",
      body: "Inter",
      photo: { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 0, shadow: false },
      stickers: ["heart", "sparkle"],
    },
    cover: "full-bleed",
    pages: ["full", "two-side", "three-top", "single-caption", "four-feature", "full"],
    phrases: ["I do", "Together", "The celebration", "Love, always"],
    titlePlaceholder: "Our Wedding",
    subtitlePlaceholder: "Sophia & Daniel · 2026",
  },
  {
    id: "sunny-escape",
    name: "Sunny Escape",
    occasion: "vacation",
    description: "Sand, sea and sunshine.",
    theme: {
      background: { type: "color", color: "#fdf3e1" },
      text: "#1f4e5a",
      accent: "#26a69a",
      heading: "Pacifico",
      headingStyle: "normal",
      body: "Montserrat",
      photo: { borderWidth: 10, borderColor: "#ffffff", cornerRadius: 6, shadow: true },
      stickers: ["palm", "sun", "wave", "airplane"],
    },
    cover: "polaroid",
    pages: ["two-stack", "three-left", "single-caption", "collage-4", "four-grid", "single-caption"],
    phrases: ["Wish you were here", "Salt in the air", "Paradise found", "Good days"],
    titlePlaceholder: "Summer in Greece",
    subtitlePlaceholder: "July 2026",
  },
  {
    id: "travel-journal",
    name: "Travel Journal",
    occasion: "vacation",
    description: "Kraft paper scrapbook with taped photos.",
    theme: {
      background: { type: "pattern", pattern: "linen", color: "#6d4c2f", bg: "#e8d5b7" },
      text: "#3b2a1a",
      accent: "#a0522d",
      heading: "Amatic SC",
      headingStyle: "bold",
      body: "Caveat",
      photo: { borderWidth: 14, borderColor: "#fffdf8", cornerRadius: 0, shadow: true },
      stickers: ["tape", "map-pin", "camera", "airplane"],
    },
    cover: "polaroid",
    pages: ["collage-3", "collage-4", "single-caption", "collage-3", "two-side", "collage-4"],
    phrases: ["Day one", "Lost & found", "The road ahead", "Somewhere new", "Notes from the trip"],
    titlePlaceholder: "ADVENTURES",
    subtitlePlaceholder: "Japan · Spring 2026",
  },
  {
    id: "little-one",
    name: "Little One",
    occasion: "baby",
    description: "Soft pastels and rounded photos.",
    theme: {
      background: { type: "pattern", pattern: "dots", color: "#f8d7df", bg: "#fff5f7" },
      text: "#5b4a5e",
      accent: "#90caf9",
      heading: "Dancing Script",
      headingStyle: "bold",
      body: "Lora",
      photo: { borderWidth: 8, borderColor: "#ffffff", cornerRadius: 28, shadow: false },
      stickers: ["footprints", "star", "balloon", "crown"],
    },
    cover: "framed",
    pages: ["single-caption", "two-side", "three-top", "four-grid", "single-caption", "six-feature"],
    phrases: ["Hello, world", "First smile", "Tiny hands, big love", "Sweet dreams", "Growing every day"],
    titlePlaceholder: "Welcome, Baby Mia",
    subtitlePlaceholder: "Born March 2, 2026",
  },
  {
    id: "class-of",
    name: "Class Of",
    occasion: "graduation",
    description: "Navy and gold, bold and proud.",
    theme: {
      background: { type: "color", color: "#0f2a44" },
      text: "#ffffff",
      accent: "#d4a017",
      heading: "Bebas Neue",
      headingStyle: "normal",
      body: "Montserrat",
      photo: { borderWidth: 6, borderColor: "#d4a017", cornerRadius: 0, shadow: false },
      stickers: ["grad-cap", "diploma", "star"],
    },
    cover: "photo-top",
    pages: ["two-side", "single-caption", "four-feature", "three-row", "single-caption"],
    phrases: ["We did it", "The future is bright", "Proud moments", "On to the next chapter"],
    titlePlaceholder: "CLASS OF 2026",
    subtitlePlaceholder: "Congratulations, Alex",
  },
  {
    id: "timeless",
    name: "Timeless",
    occasion: "anniversary",
    description: "Warm blush tones for years together.",
    theme: {
      background: { type: "color", color: "#f8e9e6" },
      text: "#5a1e2a",
      accent: "#b0485b",
      heading: "Playfair Display",
      headingStyle: "italic",
      body: "Lora",
      photo: { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 0, shadow: true },
      stickers: ["heart", "rings", "branch"],
    },
    cover: "framed",
    pages: ["single-caption", "two-feature", "three-left", "single-caption", "four-grid"],
    phrases: ["Then & now", "Still you", "Every year, more", "Our story"],
    titlePlaceholder: "25 Years Together",
    subtitlePlaceholder: "1996 – 2026",
  },
  {
    id: "family-moments",
    name: "Family Moments",
    occasion: "family",
    description: "Warm neutrals for everyday memories.",
    theme: {
      background: { type: "color", color: "#f5efe6" },
      text: "#3e3229",
      accent: "#c2593b",
      heading: "Playfair Display",
      headingStyle: "normal",
      body: "Lora",
      photo: { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 4, shadow: false },
      stickers: ["branch", "heart", "paw", "flower"],
    },
    cover: "photo-top",
    pages: ["three-left", "two-side", "single-caption", "six-grid", "four-feature", "single-caption"],
    phrases: ["Home is where we are", "Little moments", "Together", "Our year"],
    titlePlaceholder: "The Johnsons",
    subtitlePlaceholder: "Our family year · 2026",
  },
  {
    id: "festive",
    name: "Festive",
    occasion: "holiday",
    description: "Cozy holiday reds and greens.",
    theme: {
      background: { type: "pattern", pattern: "checks", color: "#f1d6d3", bg: "#fbf7f0" },
      text: "#1a3d2f",
      accent: "#b71c1c",
      heading: "Dancing Script",
      headingStyle: "bold",
      body: "Lora",
      photo: { borderWidth: 10, borderColor: "#ffffff", cornerRadius: 0, shadow: true },
      stickers: ["tree", "snowflake", "gift", "star"],
    },
    cover: "polaroid",
    pages: ["two-side", "single-caption", "three-top", "four-grid", "single-caption"],
    phrases: ["Merry & bright", "Home for the holidays", "Joy", "Season's greetings"],
    titlePlaceholder: "Holidays 2026",
    subtitlePlaceholder: "With love from our family",
  },
  {
    id: "simply-white",
    name: "Simply White",
    occasion: "other",
    description: "Minimal pages that let photos speak.",
    theme: {
      background: { type: "color", color: "#ffffff" },
      text: "#1f1b16",
      accent: "#1f1b16",
      heading: "Inter",
      headingStyle: "bold",
      body: "Inter",
      photo: { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 0, shadow: false },
      stickers: [],
    },
    cover: "full-bleed",
    pages: ["full", "two-side", "single", "four-grid", "three-row", "full"],
    phrases: ["Moments"],
    titlePlaceholder: "Moments",
    subtitlePlaceholder: "2026",
  },
  {
    id: "blank",
    name: "Blank",
    occasion: "other",
    description: "Start from an empty album.",
    theme: {
      background: { type: "color", color: "#ffffff" },
      text: "#1f1b16",
      accent: "#c2593b",
      heading: "Playfair Display",
      headingStyle: "normal",
      body: "Inter",
      photo: { borderWidth: 0, borderColor: "#ffffff", cornerRadius: 0, shadow: false },
      stickers: [],
    },
    cover: "title-only",
    pages: ["single"],
    phrases: ["Add a caption"],
    titlePlaceholder: "My Album",
    subtitlePlaceholder: "",
  },
];

export function templateById(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[TEMPLATES.length - 1];
}

function heading(theme: Theme, text: string, x: number, y: number, width: number, fontSize: number, fill = theme.text): TextEl {
  return newTextEl(
    { x, y, width, height: Math.round(fontSize * 1.3), rotation: 0 },
    { text, role: "heading", fontFamily: theme.heading, fontStyle: theme.headingStyle, fontSize: Math.round(fontSize), fill, align: "center" },
  );
}

function body(theme: Theme, text: string, x: number, y: number, width: number, fontSize: number, fill = theme.text): TextEl {
  return newTextEl(
    { x, y, width, height: Math.round(fontSize * 1.3), rotation: 0 },
    { text, role: "body", fontFamily: theme.body, fontSize: Math.round(fontSize), fill, align: "center", letterSpacing: 1 },
  );
}

function sticker(theme: Theme, index: number, x: number, y: number, size: number, rotation = 0) {
  const id = theme.stickers[index % Math.max(1, theme.stickers.length)];
  const def = stickerById(id);
  if (!def) return null;
  const color = def.defaultColor;
  return newStickerEl(id, color, { x, y, width: size, height: size, rotation });
}

function buildCover(t: Template, w: number, h: number, title: string, subtitle: string): AlbumElement[] {
  const th = t.theme;
  const min = Math.min(w, h);
  const els: (AlbumElement | null)[] = [];
  const titleSize = min * (th.heading === "Great Vibes" || th.heading === "Pacifico" || th.heading === "Dancing Script" ? 0.1 : 0.09);
  const subSize = min * 0.038;

  switch (t.cover) {
    case "polaroid": {
      const pw = w * 0.62;
      const ph = Math.min(h * 0.56, pw * 0.85);
      const px = (w - pw) / 2;
      const py = h * 0.08;
      const rot = -3;
      els.push(newPhotoEl({ x: px, y: py + pw * 0.05, width: pw, height: ph, rotation: rot }, { ...th.photo, borderWidth: Math.max(th.photo.borderWidth, 16), shadow: true }));
      const ty = py + ph + h * 0.08;
      els.push(heading(th, title, w * 0.08, ty, w * 0.84, titleSize));
      if (subtitle) els.push(body(th, subtitle, w * 0.1, ty + titleSize * 1.45, w * 0.8, subSize));
      els.push(sticker(th, 0, w * 0.04, h * 0.04, min * 0.16, -12));
      els.push(sticker(th, 1, w * 0.8, h * 0.78, min * 0.15, 10));
      break;
    }
    case "framed": {
      els.push(heading(th, title, w * 0.08, h * 0.08, w * 0.84, titleSize));
      const pw = w * 0.6;
      const ph = h * 0.5;
      els.push(newPhotoEl({ x: (w - pw) / 2, y: h * 0.08 + titleSize * 1.6, width: pw, height: ph, rotation: 0 }, th.photo));
      if (subtitle) els.push(body(th, subtitle, w * 0.1, h * 0.08 + titleSize * 1.6 + ph + h * 0.05, w * 0.8, subSize));
      els.push(sticker(th, 0, w * 0.04, h * 0.78, min * 0.18, -20));
      els.push(sticker(th, 0, w * 0.78, h * 0.04, min * 0.18, 160));
      break;
    }
    case "photo-top": {
      const ph = h * 0.62;
      els.push(newPhotoEl({ x: 0, y: 0, width: w, height: ph, rotation: 0 }, { ...th.photo, borderWidth: 0, cornerRadius: 0, shadow: false }));
      els.push(newShapeEl("rect", { x: w * 0.35, y: ph + h * 0.045, width: w * 0.3, height: Math.max(3, min * 0.006), rotation: 0 }, { fill: th.accent }));
      els.push(heading(th, title, w * 0.06, ph + h * 0.08, w * 0.88, titleSize));
      if (subtitle) els.push(body(th, subtitle, w * 0.1, ph + h * 0.08 + titleSize * 1.4, w * 0.8, subSize));
      break;
    }
    case "full-bleed": {
      els.push(newPhotoEl({ x: 0, y: 0, width: w, height: h, rotation: 0 }, { ...th.photo, borderWidth: 0, cornerRadius: 0, shadow: false }));
      const bh = h * 0.22;
      els.push({ ...newShapeEl("rect", { x: 0, y: h - bh, width: w, height: bh, rotation: 0 }, { fill: "#000000" }), opacity: 0.38 });
      els.push(heading(th, title, w * 0.06, h - bh + bh * 0.16, w * 0.88, titleSize * 0.9, "#ffffff"));
      if (subtitle) els.push(body(th, subtitle, w * 0.1, h - bh + bh * 0.16 + titleSize * 1.25, w * 0.8, subSize, "#ffffff"));
      break;
    }
    case "title-only": {
      els.push(heading(th, title, w * 0.08, h * 0.4, w * 0.84, titleSize));
      if (subtitle) els.push(body(th, subtitle, w * 0.1, h * 0.4 + titleSize * 1.5, w * 0.8, subSize));
      break;
    }
  }
  return els.filter(Boolean) as AlbumElement[];
}

export function buildAlbumDoc(templateId: string, size: PageSizeId, title: string, subtitle: string): AlbumDoc {
  const t = templateById(templateId);
  const { w, h } = pageDims(size);
  const min = Math.min(w, h);
  const doc: AlbumDoc = { version: 1, size, templateId: t.id, pages: [] };
  const cover: Page = { id: uid(), background: t.theme.coverBackground ?? t.theme.background, elements: buildCover(t, w, h, title || t.titlePlaceholder, subtitle) };
  doc.pages.push(cover);

  let phraseIdx = 0;
  t.pages.forEach((layoutId, i) => {
    const base: Page = blankPage(t.theme.background);
    // seed the page with a photo carrying the theme's photo style so applyLayout copies it
    base.elements = [newPhotoEl({ x: 0, y: 0, width: 10, height: 10, rotation: 0 }, t.theme.photo)];
    const phrase = t.phrases[phraseIdx++ % t.phrases.length];
    let page = applyLayout(base, layoutId, doc, { fontFamily: t.theme.body, fill: t.theme.text, fontSize: Math.round(min * 0.045) }, phrase);
    if (t.theme.stickers.length && i % 2 === 1 && !layoutId.startsWith("full")) {
      const s = sticker(t.theme, i + 1, w - min * 0.13, h - min * 0.13, min * 0.1, 12);
      if (s) page = { ...page, elements: [...page.elements, s] };
    }
    doc.pages.push(page);
  });
  return doc;
}

/** Re-styles an existing album with another template's look, keeping its photos and text. */
export function applyTheme(doc: AlbumDoc, templateId: string): AlbumDoc {
  const t = templateById(templateId);
  const th = t.theme;
  return {
    ...doc,
    templateId: t.id,
    pages: doc.pages.map((p, i) => ({
      ...p,
      background: i === 0 ? th.coverBackground ?? th.background : th.background,
      elements: p.elements.map((e) => {
        if (e.type === "text") {
          const onDark = e.fill.toLowerCase() === "#ffffff" && i === 0;
          return e.role === "body"
            ? { ...e, fontFamily: th.body, fontStyle: "normal" as const, fill: onDark ? e.fill : th.text }
            : { ...e, fontFamily: th.heading, fontStyle: th.headingStyle, fill: onDark ? e.fill : th.text };
        }
        if (e.type === "photo") {
          const full = e.x <= 0 && e.y <= 0;
          return full ? e : { ...e, ...th.photo };
        }
        if (e.type === "shape" && e.shape === "rect" && e.opacity === undefined) return { ...e, fill: th.accent };
        return e;
      }),
    })),
  };
}
