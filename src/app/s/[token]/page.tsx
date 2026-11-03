import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cloudEnabled } from "@/lib/config";
import { getAlbumPhotos, getSharedAlbum, toPhoto } from "@/lib/server/albums";
import ShareView from "./ShareView";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!cloudEnabled()) return {};
  const { token } = await params;
  const album = await getSharedAlbum(token);
  return album ? { title: album.title, robots: { index: false }, openGraph: album.cover.thumb ? { images: [album.cover.thumb] } : undefined } : {};
}

export default async function Page({ params }: Props) {
  if (!cloudEnabled()) notFound();
  const { token } = await params;
  const album = await getSharedAlbum(token);
  if (!album) notFound();
  const photos = (await getAlbumPhotos(album.id)).map(toPhoto);
  // Only send photos used in the album, plus guest photos (for the guest gallery).
  const used = new Set(album.doc.pages.flatMap((p) => p.elements.flatMap((e) => (e.type === "photo" && e.photoId ? [e.photoId] : []))));
  const visible = photos.filter((p) => used.has(p.id) || (album.allowGuestUploads && p.uploadedBy));
  return (
    <ShareView
      token={token}
      albumId={album.id}
      title={album.title}
      doc={album.doc}
      photos={visible}
      allowDownload={album.allowDownload}
      allowGuestUploads={album.allowGuestUploads}
    />
  );
}
