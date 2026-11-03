import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import EditorLoader from "@/components/editor/EditorLoader";
import { currentUser } from "@/auth";
import { cloudEnabled } from "@/lib/config";
import { getAlbumPhotos, getOwnedAlbum, toAlbum } from "@/lib/server/albums";

export const metadata: Metadata = { title: "Edit album" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!cloudEnabled()) notFound();
  const user = await currentUser();
  if (!user) redirect(`/signin?next=/edit/${id}`);
  const row = await getOwnedAlbum(id, user.id);
  if (!row) notFound();
  const album = toAlbum(row, await getAlbumPhotos(id));
  return <EditorLoader album={album} />;
}
