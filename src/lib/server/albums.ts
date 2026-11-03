import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Album, Photo } from "@/lib/types";

type AlbumRow = typeof schema.albums.$inferSelect;
type PhotoRow = typeof schema.photos.$inferSelect;

export function toPhoto(p: PhotoRow): Photo {
  return { id: p.id, src: p.url, thumb: p.thumbUrl, width: p.width, height: p.height, uploadedBy: p.uploadedBy, createdAt: p.createdAt.getTime() };
}

export function toAlbum(a: AlbumRow, photos: PhotoRow[]): Album {
  return {
    id: a.id,
    source: "cloud",
    title: a.title,
    occasion: a.occasion,
    doc: a.doc,
    cover: a.cover,
    photos: photos.map(toPhoto),
    updatedAt: a.updatedAt.getTime(),
    shareToken: a.shareToken,
    shareEnabled: a.shareEnabled,
    allowGuestUploads: a.allowGuestUploads,
    allowDownload: a.allowDownload,
  };
}

export async function getOwnedAlbum(albumId: string, userId: string) {
  const db = getDb();
  const [row] = await db.select().from(schema.albums).where(and(eq(schema.albums.id, albumId), eq(schema.albums.ownerId, userId)));
  return row ?? null;
}

export async function getAlbumPhotos(albumId: string) {
  return getDb().select().from(schema.photos).where(eq(schema.photos.albumId, albumId)).orderBy(asc(schema.photos.createdAt));
}

export async function getSharedAlbum(token: string) {
  const [row] = await getDb().select().from(schema.albums).where(eq(schema.albums.shareToken, token));
  if (!row || !row.shareEnabled) return null;
  return row;
}

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Folder each album's files live under in Blob storage. */
export const albumPrefix = (albumId: string) => `albums/${albumId}/`;
