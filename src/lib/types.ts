// Album document model. All coordinates are in "page units": 100 units = 1 inch.

export type PageSizeId = "8x8" | "10x10" | "12x12" | "11x8.5" | "8.5x11" | "a4" | "a4-land";

export type Background =
  | { type: "color"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "pattern"; pattern: PatternId; color: string; bg: string };

export type PatternId = "dots" | "stripes" | "grid" | "confetti" | "hearts" | "linen" | "checks";

interface BaseEl {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity?: number;
}

export interface PhotoFilters {
  grayscale: boolean;
  sepia: boolean;
  brightness: number; // -1..1
  contrast: number; // -100..100
}

export interface PhotoEl extends BaseEl {
  type: "photo";
  photoId: string | null; // null = empty slot (placeholder)
  zoom: number; // >= 1
  focusX: number; // 0..1, horizontal crop position
  focusY: number; // 0..1, vertical crop position
  filters: PhotoFilters;
  borderWidth: number;
  borderColor: string;
  cornerRadius: number;
  shadow: boolean;
}

export interface TextEl extends BaseEl {
  type: "text";
  text: string;
  role?: "heading" | "body";
  fontFamily: string;
  fontSize: number;
  fontStyle: "normal" | "bold" | "italic" | "italic bold";
  fill: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export interface StickerEl extends BaseEl {
  type: "sticker";
  stickerId: string;
  color: string;
}

export interface ShapeEl extends BaseEl {
  type: "shape";
  shape: "rect" | "ellipse" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export type AlbumElement = PhotoEl | TextEl | StickerEl | ShapeEl;

export interface Page {
  id: string;
  background: Background;
  elements: AlbumElement[];
}

export interface AlbumDoc {
  version: 1;
  size: PageSizeId;
  templateId: string;
  pages: Page[];
}

export interface Photo {
  id: string;
  src: string; // full size (max 3000px)
  thumb: string; // small preview (max 400px)
  width: number;
  height: number;
  uploadedBy?: string | null; // guest name, null for the owner
  createdAt: number;
}

export type PhotoMap = Record<string, Photo>;

export interface AlbumCover {
  thumb: string | null;
  bg: string;
}

export interface Album {
  id: string;
  source: "local" | "cloud";
  title: string;
  occasion: string;
  doc: AlbumDoc;
  photos: Photo[];
  cover: AlbumCover;
  updatedAt: number;
  // cloud-only sharing settings
  shareToken?: string | null;
  shareEnabled?: boolean;
  allowGuestUploads?: boolean;
  allowDownload?: boolean;
}

export interface AlbumSummary {
  id: string;
  source: "local" | "cloud";
  title: string;
  occasion: string;
  cover: AlbumCover;
  pageCount: number;
  updatedAt: number;
}
