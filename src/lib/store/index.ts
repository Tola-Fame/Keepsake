import type { Album, AlbumDoc, Photo } from "../types";
import { localStore } from "./local";
import { cloudStore } from "./cloud";
import { docCover, remapPhotoIds } from "../doc";

export interface AlbumStore {
  save(id: string, patch: { title?: string; doc?: AlbumDoc; cover?: Album["cover"] }): Promise<unknown>;
  addPhoto(albumId: string, file: File): Promise<Photo>;
  removePhoto(albumId: string, photoId: string): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}

export function storeFor(source: Album["source"]): AlbumStore {
  return source === "cloud" ? cloudStore : localStore;
}

/** Copies a browser-only album (and its photos) into the signed-in account. Returns the new cloud id. */
export async function moveLocalAlbumToCloud(localId: string, onProgress?: (done: number, total: number) => void) {
  const album = await localStore.get(localId);
  if (!album) throw new Error("Album not found");
  const cloudId = await cloudStore.create({ title: album.title, occasion: album.occasion, doc: album.doc, cover: { thumb: null, bg: album.cover.bg } });
  const blobs = await localStore.photoBlobs(localId);
  const idMap: Record<string, string> = {};
  const uploaded: Photo[] = [];
  let done = 0;
  onProgress?.(0, blobs.length);
  // upload a few at a time
  const queue = [...blobs];
  await Promise.all(
    Array.from({ length: Math.min(3, queue.length) }, async () => {
      while (queue.length) {
        const p = queue.shift()!;
        const photo = await cloudStore.addPhotoBlobs(cloudId, p.full, p.thumb, p.width, p.height, `photo-${p.id}`);
        idMap[p.id] = photo.id;
        uploaded.push(photo);
        onProgress?.(++done, blobs.length);
      }
    }),
  );
  const doc = remapPhotoIds(album.doc, idMap);
  await cloudStore.save(cloudId, { doc, cover: docCover(doc, uploaded) });
  await localStore.remove(localId);
  return cloudId;
}
