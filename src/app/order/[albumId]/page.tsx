import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import { currentUser } from "@/auth";
import { cloudEnabled } from "@/lib/config";
import { getAlbumPhotos, getOwnedAlbum, toPhoto } from "@/lib/server/albums";
import { usedPhotoIds } from "@/lib/doc";
import OrderForm from "./OrderForm";

export const metadata: Metadata = { title: "Order a printed book" };

type Props = { params: Promise<{ albumId: string }> };

export default async function Page({ params }: Props) {
  const { albumId } = await params;
  if (!cloudEnabled()) notFound();
  const user = await currentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/order/${albumId}`)}`);
  const album = await getOwnedAlbum(albumId, user.id);
  if (!album) notFound();
  const used = usedPhotoIds(album.doc);
  const photos = (await getAlbumPhotos(albumId)).filter((p) => used.has(p.id)).map(toPhoto);
  return (
    <>
      <Header />
      <OrderForm album={{ id: album.id, title: album.title, doc: album.doc, photos }} defaults={{ name: user.name ?? "", email: user.email ?? "" }} />
    </>
  );
}
