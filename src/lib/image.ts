// Client-side image helpers.

export const MAX_FULL = 3000; // longest side for stored photos (≈375 DPI on an 8" page)
export const MAX_THUMB = 400;

export interface ProcessedImage {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Fallback for browsers that cannot create bitmaps from this type.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), type, quality),
  );
}

function resize(src: CanvasImageSource, sw: number, sh: number, max: number, type: string, quality: number) {
  const scale = Math.min(1, max / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return { canvas: c, w, h };
}

/** Resizes a photo for storage and creates a thumbnail. Keeps PNG transparency. */
export async function processImage(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(file.name)) {
    throw new Error(`${file.name} is not an image.`);
  }
  let img: ImageBitmap | HTMLImageElement;
  try {
    img = await decode(file);
  } catch {
    throw new Error(`${file.name} could not be opened. Please use JPG, PNG or WebP.`);
  }
  const sw = "naturalWidth" in img ? img.naturalWidth : img.width;
  const sh = "naturalHeight" in img ? img.naturalHeight : img.height;
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const full = resize(img, sw, sh, MAX_FULL, type, 0.9);
  const thumb = resize(full.canvas, full.w, full.h, MAX_THUMB, "image/jpeg", 0.8);
  const [fullBlob, thumbBlob] = await Promise.all([toBlob(full.canvas, type, 0.9), toBlob(thumb.canvas, "image/jpeg", 0.8)]);
  if ("close" in img) img.close();
  return { full: fullBlob, thumb: thumbBlob, width: full.w, height: full.h };
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

/** Loads (and caches) an image element. Cross-origin so the canvas can be exported. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imageCache.get(src);
  if (!p) {
    const remote = /^https?:/.test(src) && !src.startsWith(location.origin);
    const attempt = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (remote) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image failed to load"));
        img.src = url;
      });
    p = attempt(src)
      // fall back to this site's image route if the storage host blocks cross-origin reads
      .catch(() => (remote ? attempt(`/api/image?url=${encodeURIComponent(src)}`) : Promise.reject(new Error("Image failed to load"))))
      .catch((e) => {
        imageCache.delete(src);
        throw e;
      });
    imageCache.set(src, p);
  }
  return p;
}
