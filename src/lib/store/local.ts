// Browser-only storage (IndexedDB). Used when the visitor is not signed in.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Album, AlbumDoc, AlbumSummary, Photo } from "../types";
import { uid } from "../doc";
import { processImage } from "../image";

interface StoredAlbum {
  id: string;
  title: string;
  occasion: string;
  doc: AlbumDoc;
  cover: Album["cover"];
  updatedAt: number;
}

interface StoredPhoto {
  id: string;
  albumId: string;
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  createdAt: number;
}

interface KeepsakeDB extends DBSchema {
  albums: { key: string; value: StoredAlbum };
  photos: { key: string; value: StoredPhoto; indexes: { byAlbum: string } };
}

let dbPromise: Promise<IDBPDatabase<KeepsakeDB>> | null = null;
function db() {
  if (!dbPromise) {
    dbPromise = openDB<KeepsakeDB>("keepsake", 1, {
      upgrade(d) {
        d.createObjectStore("albums", { keyPath: "id" });
        const photos = d.createObjectStore("photos", { keyPath: "id" });
        photos.createIndex("byAlbum", "albumId");
      },
    });
  }
  return dbPromise;
}

// Object URLs are kept per photo id so they can be reused and revoked.
const urls = new Map<string, { src: string; thumb: string }>();
function toPhoto(p: StoredPhoto): Photo {
  let u = urls.get(p.id);
  if (!u) {
    u = { src: URL.createObjectURL(p.full), thumb: URL.createObjectURL(p.thumb) };
    urls.set(p.id, u);
  }
  return { id: p.id, src: u.src, thumb: u.thumb, width: p.width, height: p.height, uploadedBy: null, createdAt: p.createdAt };
}

let lastStamp = 0;
const stamp = () => (lastStamp = Math.max(Date.now(), lastStamp + 1));

export const localStore = {
  async list(): Promise<AlbumSummary[]> {
    const all = await (await db()).getAll("albums");
    const summaries = await Promise.all(
      all.map(async (a) => {
        // cover thumbs are object URLs that do not survive reloads; rebuild from stored photos
        let thumb: string | null = null;
        const firstPhotoId = a.doc.pages.flatMap((p) => p.elements).find((e) => e.type === "photo" && e.photoId);
        if (firstPhotoId && firstPhotoId.type === "photo" && firstPhotoId.photoId) {
          const ph = await (await db()).get("photos", firstPhotoId.photoId);
          if (ph) thumb = toPhoto(ph).thumb;
        }
        return {
          id: a.id,
          source: "local" as const,
          title: a.title,
          occasion: a.occasion,
          cover: { thumb, bg: a.cover.bg },
          pageCount: a.doc.pages.length,
          updatedAt: a.updatedAt,
        };
      }),
    );
    return summaries.sort((x, y) => y.updatedAt - x.updatedAt);
  },

  async get(id: string): Promise<Album | null> {
    const d = await db();
    const a = await d.get("albums", id);
    if (!a) return null;
    const photos = (await d.getAllFromIndex("photos", "byAlbum", id)).sort((x, y) => x.createdAt - y.createdAt).map(toPhoto);
    return { ...a, source: "local", photos };
  },

  async create(input: { title: string; occasion: string; doc: AlbumDoc; cover: Album["cover"] }): Promise<string> {
    const id = uid();
    await (await db()).put("albums", { id, ...input, updatedAt: Date.now() });
    return id;
  },

  async save(id: string, patch: { title?: string; doc?: AlbumDoc; cover?: Album["cover"] }) {
    const d = await db();
    const a = await d.get("albums", id);
    if (!a) throw new Error("Album not found");
    await d.put("albums", { ...a, ...patch, updatedAt: Date.now() });
  },

  async remove(id: string) {
    const d = await db();
    const photos = await d.getAllKeysFromIndex("photos", "byAlbum", id);
    const tx = d.transaction(["albums", "photos"], "readwrite");
    await Promise.all([tx.objectStore("albums").delete(id), ...photos.map((k) => tx.objectStore("photos").delete(k)), tx.done]);
  },

  async addPhoto(albumId: string, file: File): Promise<Photo> {
    const createdAt = stamp(); // taken before processing so photos keep the order they were chosen in
    const img = await processImage(file);
    const rec: StoredPhoto = { id: uid(), albumId, full: img.full, thumb: img.thumb, width: img.width, height: img.height, createdAt };
    await (await db()).put("photos", rec);
    return toPhoto(rec);
  },

  async removePhoto(_albumId: string, photoId: string) {
    await (await db()).delete("photos", photoId);
    const u = urls.get(photoId);
    if (u) {
      URL.revokeObjectURL(u.src);
      URL.revokeObjectURL(u.thumb);
      urls.delete(photoId);
    }
  },

  /** Raw photo blobs, used when moving an album to the cloud. */
  async photoBlobs(albumId: string) {
    return (await db()).getAllFromIndex("photos", "byAlbum", albumId);
  },
};
