import { NextResponse } from "next/server";
import { z } from "zod";
import { albumPrefix, getAlbumPhotos, getSharedAlbum, toPhoto } from "@/lib/server/albums";
import { registerPhoto, registerSchema } from "@/lib/server/photos";

type Ctx = { params: Promise<{ token: string }> };

// Guests list the photos other guests added.
export async function GET(_req: Request, { params }: Ctx) {
  const { token } = await params;
  const album = await getSharedAlbum(token);
  if (!album || !album.allowGuestUploads) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const photos = (await getAlbumPhotos(album.id)).filter((p) => p.uploadedBy);
  return NextResponse.json(photos.map(toPhoto));
}

const guestSchema = registerSchema.extend({ guestName: z.string().trim().min(1).max(60) });

export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  const album = await getSharedAlbum(token);
  if (!album || !album.allowGuestUploads) return NextResponse.json({ error: "Guest uploads are closed" }, { status: 403 });
  const parsed = guestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  const { guestName, ...photo } = parsed.data;
  try {
    return NextResponse.json(await registerPhoto(album.id, albumPrefix(album.id) + "guest/", photo, guestName));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
