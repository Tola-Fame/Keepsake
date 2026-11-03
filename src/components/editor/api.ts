import type { Album, AlbumDoc, AlbumElement, Page, Photo, PhotoMap } from "@/lib/types";

export interface UploadItem {
  id: string;
  name: string;
  status: "uploading" | "error";
  error?: string;
}

/** Everything panels need to read and change the album. */
export interface EditorApi {
  album: Album;
  doc: AlbumDoc;
  page: Page;
  pageIndex: number;
  pageW: number;
  pageH: number;
  photos: Photo[];
  photoMap: PhotoMap;
  selected: AlbumElement | null;
  uploads: UploadItem[];
  updateDoc: (fn: (d: AlbumDoc) => AlbumDoc, key?: string) => void;
  updatePage: (fn: (p: Page) => Page, key?: string) => void;
  updateElement: (id: string, patch: Partial<AlbumElement>, key?: string) => void;
  addElement: (el: AlbumElement) => void;
  select: (id: string | null) => void;
  uploadFiles: (files: File[]) => Promise<void>;
  placePhoto: (photoId: string, point?: { x: number; y: number }) => void;
  removePhoto: (photoId: string) => Promise<void>;
  addPage: (layoutId?: string) => void;
  setPageIndex: (i: number) => void;
  notify: (msg: string) => void;
}
