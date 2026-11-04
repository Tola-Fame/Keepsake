import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/auth";
import { getDb, schema } from "@/db";
import { getAlbumPhotos, getOwnedAlbum, toPhoto } from "@/lib/server/albums";
import { logOrderEvent, shippingSchema } from "@/lib/server/orders";
import { usedPhotoIds } from "@/lib/doc";
import { MAX_ORDER_QUANTITY } from "@/lib/orders";

const createSchema = z.object({
  albumId: z.string().max(40),
  quantity: z.number().int().min(1).max(MAX_ORDER_QUANTITY),
  shipping: shippingSchema,
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to order a printed book." }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the order details." }, { status: 400 });
  const { albumId, quantity, shipping, notes } = parsed.data;
  const album = await getOwnedAlbum(albumId, user.id);
  if (!album) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  // keep only the photos the book uses, so the order stays the same if the album changes
  const used = usedPhotoIds(album.doc);
  const photos = (await getAlbumPhotos(albumId)).filter((p) => used.has(p.id)).map(toPhoto);
  if (!photos.length) return NextResponse.json({ error: "Add some photos to your book before ordering a print." }, { status: 400 });

  const [order] = await getDb()
    .insert(schema.printOrders)
    .values({
      userId: user.id,
      albumId,
      title: album.title,
      book: { doc: album.doc, photos, cover: album.cover },
      quantity,
      shipping,
      customerNotes: notes || null,
    })
    .returning({ id: schema.printOrders.id, number: schema.printOrders.number });
  await logOrderEvent(order.id, `Order placed for ${quantity} ${quantity === 1 ? "copy" : "copies"}.`, user.email ?? "customer", "new");
  return NextResponse.json(order);
}
