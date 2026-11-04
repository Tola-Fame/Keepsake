import { NextResponse } from "next/server";

// Downloads a photo picked with the Google Photos Picker, for browsers that can't fetch it from
// Google directly. Nothing is stored: the photo is passed straight back to the visitor.

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's response size limit is 4.5 MB

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => null);
  let url: URL;
  try {
    url = new URL(String(body?.url));
  } catch {
    return NextResponse.json({ error: "Invalid photo address" }, { status: 400 });
  }
  if (!auth?.startsWith("Bearer ") || url.protocol !== "https:" || !url.hostname.endsWith(".googleusercontent.com")) {
    return NextResponse.json({ error: "Invalid photo address" }, { status: 400 });
  }
  const res = await fetch(url, { headers: { Authorization: auth } }).catch(() => null);
  if (!res?.ok || !res.body) return NextResponse.json({ error: "Could not download the photo" }, { status: 502 });
  if (Number(res.headers.get("content-length") || 0) > MAX_BYTES) return NextResponse.json({ error: "Photo is too large" }, { status: 413 });
  const type = res.headers.get("content-type") || "image/jpeg";
  if (!type.startsWith("image/")) return NextResponse.json({ error: "Not a photo" }, { status: 400 });
  return new NextResponse(res.body, { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
}
