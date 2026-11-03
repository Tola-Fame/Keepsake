// Cloud storage client: talks to this site's API and uploads photos straight to Vercel Blob.
import { upload } from "@vercel/blob/client";
import type { Album, AlbumDoc, AlbumSummary, Photo } from "../types";
import { processImage } from "../image";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function safeName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 40) || "photo";
}

/** Uploads a processed photo (full + thumbnail) into the album's folder. */
export async function uploadPhotoFiles(albumId: string, file: File, opts: { shareToken?: string; folder?: string } = {}) {
  const img = await processImage(file);
  const ext = img.full.type === "image/png" ? "png" : "jpg";
  const base = `albums/${albumId}/${opts.folder ?? ""}${safeName(file.name)}`;
  const clientPayload = JSON.stringify({ albumId, shareToken: opts.shareToken });
  const [full, thumb] = await Promise.all([
    upload(`${base}.${ext}`, img.full, { access: "public", handleUploadUrl: "/api/upload", clientPayload, contentType: img.full.type }),
    upload(`${base}-thumb.jpg`, img.thumb, { access: "public", handleUploadUrl: "/api/upload", clientPayload, contentType: "image/jpeg" }),
  ]);
  return { url: full.url, thumbUrl: thumb.url, width: img.width, height: img.height };
}

export const cloudStore = {
  list: () => api<AlbumSummary[]>("/api/albums"),

  get: async (id: string): Promise<Album | null> => {
    const res = await fetch(`/api/albums/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Could not load album");
    return res.json();
  },

  create: async (input: { title: string; occasion: string; doc: AlbumDoc; cover: Album["cover"] }) =>
    (await api<{ id: string }>("/api/albums", { method: "POST", body: JSON.stringify(input) })).id,

  save: (id: string, patch: Partial<Pick<Album, "title" | "doc" | "cover" | "shareEnabled" | "allowGuestUploads" | "allowDownload">>) =>
    api<Pick<Album, "updatedAt" | "shareToken" | "shareEnabled" | "allowGuestUploads" | "allowDownload">>(`/api/albums/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  remove: (id: string) => api(`/api/albums/${id}`, { method: "DELETE" }),

  addPhoto: async (albumId: string, file: File): Promise<Photo> => {
    const files = await uploadPhotoFiles(albumId, file);
    return api<Photo>(`/api/albums/${albumId}/photos`, { method: "POST", body: JSON.stringify(files) });
  },

  addPhotoBlobs: async (albumId: string, full: Blob, thumb: Blob, width: number, height: number, name: string): Promise<Photo> => {
    const ext = full.type === "image/png" ? "png" : "jpg";
    const base = `albums/${albumId}/${name}`;
    const clientPayload = JSON.stringify({ albumId });
    const [f, t] = await Promise.all([
      upload(`${base}.${ext}`, full, { access: "public", handleUploadUrl: "/api/upload", clientPayload, contentType: full.type || "image/jpeg" }),
      upload(`${base}-thumb.jpg`, thumb, { access: "public", handleUploadUrl: "/api/upload", clientPayload, contentType: "image/jpeg" }),
    ]);
    return api<Photo>(`/api/albums/${albumId}/photos`, {
      method: "POST",
      body: JSON.stringify({ url: f.url, thumbUrl: t.url, width, height }),
    });
  },

  removePhoto: (albumId: string, photoId: string) => api(`/api/albums/${albumId}/photos/${photoId}`, { method: "DELETE" }),

  listPhotos: (albumId: string) => api<Photo[]>(`/api/albums/${albumId}/photos`),
};

export async function guestUpload(token: string, albumId: string, file: File, guestName: string): Promise<Photo> {
  const files = await uploadPhotoFiles(albumId, file, { shareToken: token, folder: "guest/" });
  return api<Photo>(`/api/share/${token}/photos`, { method: "POST", body: JSON.stringify({ ...files, guestName }) });
}
