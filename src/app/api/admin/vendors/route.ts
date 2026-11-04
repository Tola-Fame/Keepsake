import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { currentAdmin, vendorSchema } from "@/lib/server/orders";

export async function POST(req: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const parsed = vendorSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid vendor" }, { status: 400 });
  const [row] = await getDb().insert(schema.vendors).values(parsed.data).returning();
  return NextResponse.json(row);
}
