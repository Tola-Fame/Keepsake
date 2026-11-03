import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { currentUser } from "@/auth";
import { getDb, schema } from "@/db";
import { uid } from "@/lib/doc";
import { coverSchema, docSchema } from "@/lib/server/validation";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const rows = await getDb()
    .select({
      id: schema.albums.id,
      title: schema.albums.title,
      occasion: schema.albums.occasion,
      cover: schema.albums.cover,
      doc: schema.albums.doc,
      updatedAt: schema.albums.updatedAt,
    })
    .from(schema.albums)
    .where(eq(schema.albums.ownerId, user.id))
    .orderBy(desc(schema.albums.updatedAt));
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      source: "cloud",
      title: r.title,
      occasion: r.occasion,
      cover: r.cover,
      pageCount: r.doc.pages.length,
      updatedAt: r.updatedAt.getTime(),
    })),
  );
}

const createSchema = z.object({
  title: z.string().min(1).max(120),
  occasion: z.string().max(40),
  doc: docSchema,
  cover: coverSchema,
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid album" }, { status: 400 });
  const id = uid();
  await getDb()
    .insert(schema.albums)
    .values({ id, ownerId: user.id, ...parsed.data });
  return NextResponse.json({ id });
}
