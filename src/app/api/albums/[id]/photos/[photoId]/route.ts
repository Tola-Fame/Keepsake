import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { blobAuth } from "@/lib/config";
import { currentUser } from "@/auth";
import { getDb, schema } from "@/db";
import { getOwnedAlbum } from "@/lib/server/albums";
import { hasOpenOrders } from "@/lib/server/orders";

type Ctx = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id, photoId } = await params;
  if (!(await getOwnedAlbum(id, user.id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [row] = await getDb()
    .delete(schema.photos)
    .where(and(eq(schema.photos.id, photoId), eq(schema.photos.albumId, id)))
    .returning();
  // an order in progress still needs the file for printing, so only remove it from the album
  if (row && !(await hasOpenOrders(id))) await del([row.url, row.thumbUrl], blobAuth()).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
