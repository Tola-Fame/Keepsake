import { NextResponse } from "next/server";
import { currentUser } from "@/auth";
import { albumPrefix, getAlbumPhotos, getOwnedAlbum, toPhoto } from "@/lib/server/albums";
import { registerPhoto, registerSchema } from "@/lib/server/photos";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  if (!(await getOwnedAlbum(id, user.id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json((await getAlbumPhotos(id)).map(toPhoto));
}

export async function POST(req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  if (!(await getOwnedAlbum(id, user.id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid photo" }, { status: 400 });
  try {
    return NextResponse.json(await registerPhoto(id, albumPrefix(id), parsed.data, null));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
