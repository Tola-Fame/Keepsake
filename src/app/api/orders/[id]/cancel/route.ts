import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@/auth";
import { getDb, schema } from "@/db";
import { logOrderEvent } from "@/lib/server/orders";

type Ctx = { params: Promise<{ id: string }> };

/** Customers can cancel an order until the team confirms it. */
export async function POST(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  const [row] = await getDb()
    .update(schema.printOrders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(schema.printOrders.id, id), eq(schema.printOrders.userId, user.id), eq(schema.printOrders.status, "new")))
    .returning({ id: schema.printOrders.id });
  if (!row) return NextResponse.json({ error: "This order can no longer be cancelled online. Please contact us." }, { status: 409 });
  await logOrderEvent(id, "Cancelled by the customer.", user.email ?? "customer", "cancelled");
  return NextResponse.json({ ok: true });
}
