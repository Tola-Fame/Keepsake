import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentAdmin, vendorSchema } from "@/lib/server/orders";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const { id } = await params;
  const parsed = vendorSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid vendor" }, { status: 400 });
  const [row] = await getDb().update(schema.vendors).set(parsed.data).where(eq(schema.vendors.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  return NextResponse.json(row);
}
