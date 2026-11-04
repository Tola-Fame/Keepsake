import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { count, eq } from "drizzle-orm";
import { currentUser } from "@/auth";
import { blobToken } from "@/lib/config";
import { getDb, schema } from "@/db";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, albumPrefix, getOwnedAlbum, getSharedAlbum } from "@/lib/server/albums";

const MAX_PHOTOS_PER_ALBUM = 1500;

// Issues short-lived upload tokens so the browser can send photos straight to Vercel Blob.
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      token: blobToken(),
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}") as { albumId?: string; shareToken?: string };
        if (!payload.albumId) throw new Error("Missing album");
        let albumId: string;
        if (payload.shareToken) {
          const album = await getSharedAlbum(payload.shareToken);
          if (!album || !album.allowGuestUploads || album.id !== payload.albumId) throw new Error("Guest uploads are not allowed");
          albumId = album.id;
          if (!pathname.startsWith(albumPrefix(albumId) + "guest/")) throw new Error("Invalid path");
        } else {
          const user = await currentUser();
          if (!user) throw new Error("Not signed in");
          const album = await getOwnedAlbum(payload.albumId, user.id);
          if (!album) throw new Error("Album not found");
          albumId = album.id;
          if (!pathname.startsWith(albumPrefix(albumId))) throw new Error("Invalid path");
        }
        const [{ n }] = await getDb().select({ n: count() }).from(schema.photos).where(eq(schema.photos.albumId, albumId));
        if (n >= MAX_PHOTOS_PER_ALBUM) throw new Error("This album has reached the photo limit");
        return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
