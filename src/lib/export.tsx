"use client";

import { createRoot } from "react-dom/client";
import type Konva from "konva";
import type { AlbumDoc, Page, PhotoMap } from "./types";
import { PAGE_SIZES, PRINT_PIXEL_RATIO, UNITS_PER_INCH, pageDims } from "./pageSizes";
import PageView from "@/components/canvas/PageView";

export type ExportQuality = "print" | "screen";

/** Renders one page off-screen and returns it as a JPEG data URL. */
export function renderPage(doc: AlbumDoc, page: Page, photos: PhotoMap, quality: ExportQuality = "print"): Promise<string> {
  const ratio = quality === "print" ? PRINT_PIXEL_RATIO : 1.2;
  return new Promise((resolve, reject) => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-100000px;top:0;pointer-events:none;opacity:0";
    document.body.appendChild(host);
    const root = createRoot(host);
    const cleanup = () => {
      root.unmount();
      host.remove();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("A page took too long to render. Check your internet connection and try again."));
    }, 60000);
    const onReady = (stage: Konva.Stage) => {
      try {
        const url = stage.toDataURL({ mimeType: "image/jpeg", quality: 0.92, pixelRatio: ratio });
        clearTimeout(timer);
        cleanup();
        resolve(url);
      } catch (e) {
        clearTimeout(timer);
        cleanup();
        reject(e);
      }
    };
    root.render(<PageView doc={doc} page={page} photos={photos} scale={1} pixelRatio={ratio} onReady={onReady} />);
  });
}

function slug(title: string) {
  return title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "album";
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Creates a print-ready PDF at 300 DPI with one album page per PDF page. */
export async function exportPdf(doc: AlbumDoc, photos: PhotoMap, title: string, onProgress?: (done: number, total: number) => void) {
  const { jsPDF } = await import("jspdf");
  const { w, h } = pageDims(doc.size);
  const wi = w / UNITS_PER_INCH;
  const hi = h / UNITS_PER_INCH;
  const pdf = new jsPDF({ unit: "in", format: [wi, hi], orientation: wi > hi ? "landscape" : "portrait", compress: true });
  pdf.setProperties({ title, creator: "Keepsake" });
  for (let i = 0; i < doc.pages.length; i++) {
    onProgress?.(i, doc.pages.length);
    const img = await renderPage(doc, doc.pages[i], photos, "print");
    if (i > 0) pdf.addPage([wi, hi], wi > hi ? "landscape" : "portrait");
    pdf.addImage(img, "JPEG", 0, 0, wi, hi, undefined, "FAST");
  }
  onProgress?.(doc.pages.length, doc.pages.length);
  saveBlob(pdf.output("blob"), `${slug(title)}.pdf`);
}

/** Downloads every page as a high-resolution JPG inside a zip file. */
export async function exportImages(doc: AlbumDoc, photos: PhotoMap, title: string, onProgress?: (done: number, total: number) => void) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (let i = 0; i < doc.pages.length; i++) {
    onProgress?.(i, doc.pages.length);
    const url = await renderPage(doc, doc.pages[i], photos, "print");
    zip.file(`${slug(title)}-page-${String(i + 1).padStart(2, "0")}.jpg`, url.split(",")[1], { base64: true });
  }
  onProgress?.(doc.pages.length, doc.pages.length);
  saveBlob(await zip.generateAsync({ type: "blob" }), `${slug(title)}-pages.zip`);
}

/** Opens the system print dialog with each album page sized exactly to the paper. */
export async function printAlbum(doc: AlbumDoc, photos: PhotoMap, title: string, onProgress?: (done: number, total: number) => void) {
  const size = PAGE_SIZES[doc.size];
  const wi = size.width / UNITS_PER_INCH;
  const hi = size.height / UNITS_PER_INCH;
  const images: string[] = [];
  for (let i = 0; i < doc.pages.length; i++) {
    onProgress?.(i, doc.pages.length);
    images.push(await renderPage(doc, doc.pages[i], photos, "print"));
  }
  onProgress?.(doc.pages.length, doc.pages.length);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const d = iframe.contentDocument!;
  d.open();
  d.write(`<!doctype html><html><head><title>${title.replace(/</g, "&lt;")}</title><style>
    @page { size: ${wi}in ${hi}in; margin: 0; }
    html, body { margin: 0; padding: 0; }
    img { display: block; width: ${wi}in; height: ${hi}in; page-break-after: always; break-after: page; }
    img:last-child { page-break-after: auto; break-after: auto; }
  </style></head><body>${images.map((src) => `<img src="${src}">`).join("")}</body></html>`);
  d.close();
  await Promise.all(Array.from(d.images).map((img) => (img.complete ? Promise.resolve() : new Promise((r) => (img.onload = r)))));
  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();
  setTimeout(() => iframe.remove(), 60000);
}
