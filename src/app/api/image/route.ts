// Same-origin fallback for album photos, used only if the browser cannot read a
// Blob image directly (needed to draw it on a canvas for PDF/print export).
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") || "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Bad url", { status: 400 });
  }
  if (target.protocol !== "https:" || !target.hostname.endsWith(".blob.vercel-storage.com")) {
    return new Response("Not allowed", { status: 403 });
  }
  const res = await fetch(target, { cache: "force-cache" });
  if (!res.ok || !res.body) return new Response("Not found", { status: 404 });
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) return new Response("Not an image", { status: 415 });
  return new Response(res.body, {
    headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" },
  });
}
