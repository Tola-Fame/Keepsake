import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";
import { del } from "@vercel/blob";
import { blobAuth } from "@/lib/config";
import { currentUser } from "@/auth";
import { getDb, schema } from "@/db";
import { getAlbumPhotos, getOwnedAlbum, toAlbum } from "@/lib/server/albums";
import { coverSchema, docSchema } from "@/lib/server/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  const album = await getOwnedAlbum(id, user.id);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toAlbum(album, await getAlbumPhotos(id)));
}

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  doc: docSchema.optional(),
  cover: coverSchema.optional(),
  shareEnabled: z.boolean().optional(),
  allowGuestUploads: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  const album = await getOwnedAlbum(id, user.id);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid changes" }, { status: 400 });
  const data = parsed.data;
  const shareToken = data.shareEnabled && !album.shareToken ? nanoid(16) : album.shareToken;
  const [row] = await getDb()
    .update(schema.albums)
    .set({ ...data, shareToken, updatedAt: new Date() })
    .where(eq(schema.albums.id, id))
    .returning();
  return NextResponse.json({
    updatedAt: row.updatedAt.getTime(),
    shareToken: row.shareToken,
    shareEnabled: row.shareEnabled,
    allowGuestUploads: row.allowGuestUploads,
    allowDownload: row.allowDownload,
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  const album = await getOwnedAlbum(id, user.id);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const photos = await getAlbumPhotos(id);
  const urls = photos.flatMap((p) => [p.url, p.thumbUrl]);
  if (urls.length) await del(urls, blobAuth()).catch(() => undefined);
  await getDb().delete(schema.albums).where(eq(schema.albums.id, id));
  return NextResponse.json({ ok: true });
}
