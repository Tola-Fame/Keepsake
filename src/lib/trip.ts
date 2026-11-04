// Builds a travel book from trip photos: a cover, then each day of the trip in date order.

import type { AlbumDoc, Page, PageSizeId, Photo } from "./types";
import { pageDims } from "./pageSizes";
import { applyLayout, blankPage, newPhotoEl, uid, type CaptionStyle } from "./doc";
import { buildCover, sticker, templateById, type Template } from "./templates";

export const MAX_TRIP_PHOTOS = 200;

export interface TripPhoto {
  photo: Photo;
  takenAt: number;
}

const dayKey = (ts: number) => new Date(ts).toDateString();

/** Groups items by the calendar day they were taken, oldest first. */
export function groupByDay<T extends { takenAt: number }>(items: T[]): T[][] {
  const days = new Map<string, T[]>();
  for (const it of [...items].sort((a, b) => a.takenAt - b.takenAt)) {
    const k = dayKey(it.takenAt);
    if (!days.has(k)) days.set(k, []);
    days.get(k)!.push(it);
  }
  return [...days.values()];
}

export function dayLabel(index: number, ts: number) {
  return `Day ${index + 1} · ${new Date(ts).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}`;
}

/** "3 – 9 March 2026", in the visitor's own date format. */
export function dateRangeLabel(from: number, to: number) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).formatRange(new Date(from), new Date(to));
}

/** Splits n photos into pages of at most 4, as evenly as possible. */
function pageGroups(n: number): number[] {
  if (n <= 0) return [];
  const pages = Math.ceil(n / 4);
  const base = Math.floor(n / pages);
  return Array.from({ length: pages }, (_, i) => base + (i < n % pages ? 1 : 0));
}

function layoutFor(photos: Photo[], variant: number) {
  if (photos.length === 1) return "single";
  if (photos.length === 2) {
    if (photos.every((p) => p.width > p.height)) return "two-stack";
    if (photos.every((p) => p.height > p.width)) return "two-side";
    return "two-feature";
  }
  const options = photos.length === 3 ? ["three-left", "three-top", "collage-3"] : ["four-grid", "collage-4", "four-feature"];
  return options[variant % options.length];
}

/** Puts photos into a page's empty photo slots, in order. */
function fillPhotos(page: Page, photos: Photo[]): Page {
  let i = 0;
  return { ...page, elements: page.elements.map((e) => (e.type === "photo" && !e.photoId && photos[i] ? { ...e, photoId: photos[i++].id } : e)) };
}

function photoPage(t: Template, doc: AlbumDoc, layoutId: string, photos: Photo[], caption?: CaptionStyle, captionText?: string): Page {
  const base = blankPage(t.theme.background);
  // seed the page with a photo carrying the theme's photo style so applyLayout copies it
  base.elements = [newPhotoEl({ x: 0, y: 0, width: 10, height: 10, rotation: 0 }, t.theme.photo)];
  return fillPhotos(applyLayout(base, layoutId, doc, caption, captionText), photos);
}

export function buildTripDoc(templateId: string, size: PageSizeId, title: string, subtitle: string, items: TripPhoto[]): AlbumDoc {
  const t = templateById(templateId);
  const { w, h } = pageDims(size);
  const min = Math.min(w, h);
  const doc: AlbumDoc = { version: 1, size, templateId: t.id, pages: [] };
  const days = groupByDay(items);
  const all = days.flat();
  const coverPhoto = all.find((i) => i.photo.width >= i.photo.height) ?? all[0];
  const cover: Page = { id: uid(), background: t.theme.coverBackground ?? t.theme.background, elements: buildCover(t, w, h, title || t.titlePlaceholder, subtitle) };
  doc.pages.push(fillPhotos(cover, coverPhoto ? [coverPhoto.photo] : []));

  const caption: CaptionStyle = { fontFamily: t.theme.body, fill: t.theme.text, fontSize: Math.round(min * 0.045) };
  days.forEach((day, d) => {
    // each day opens with one photo and its date
    doc.pages.push(photoPage(t, doc, "single-caption", [day[0].photo], caption, dayLabel(d, day[0].takenAt)));
    let i = 1;
    for (const n of pageGroups(day.length - 1)) {
      const group = day.slice(i, i + n).map((x) => x.photo);
      i += n;
      const layoutId = layoutFor(group, doc.pages.length);
      let page = photoPage(t, doc, layoutId, group);
      if (t.theme.stickers.length && doc.pages.length % 3 === 0 && !layoutId.startsWith("collage")) {
        const s = sticker(t.theme, doc.pages.length, w - min * 0.13, h - min * 0.13, min * 0.1, 12);
        if (s) page = { ...page, elements: [...page.elements, s] };
      }
      doc.pages.push(page);
    }
  });
  return doc;
}
