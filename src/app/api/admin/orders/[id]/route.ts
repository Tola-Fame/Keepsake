import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { currentAdmin, logOrderEvent, optText, statusSchema } from "@/lib/server/orders";
import { statusInfo } from "@/lib/orders";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: statusSchema.optional(),
  vendorId: z.string().max(40).nullable().optional(),
  price: optText(120),
  trackingCarrier: optText(120),
  trackingNumber: optText(200),
  trackingUrl: optText(500),
  adminNotes: optText(5000),
  /** Optional note added to the order history. */
  note: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const { id } = await params;
  const db = getDb();
  const [order] = await db.select().from(schema.printOrders).where(eq(schema.printOrders.id, id));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid changes" }, { status: 400 });
  const { note, ...changes } = parsed.data;
  const actor = admin.email ?? "team";

  if (changes.vendorId && changes.vendorId !== order.vendorId) {
    const [vendor] = await db.select().from(schema.vendors).where(eq(schema.vendors.id, changes.vendorId));
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 400 });
    await logOrderEvent(id, `Assigned to vendor: ${vendor.name}`, actor);
  } else if (changes.vendorId === null && order.vendorId) {
    await logOrderEvent(id, "Vendor removed.", actor);
  }
  if (changes.status && changes.status !== order.status) await logOrderEvent(id, `Status changed to ${statusInfo(changes.status).label}.`, actor, changes.status);
  if (changes.trackingNumber && changes.trackingNumber !== order.trackingNumber) await logOrderEvent(id, `Tracking number added: ${changes.trackingNumber}`, actor);
  if (note) await logOrderEvent(id, note, actor);

  const [row] = await db
    .update(schema.printOrders)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(schema.printOrders.id, id))
    .returning();
  return NextResponse.json({ ok: true, updatedAt: row.updatedAt.getTime() });
}
