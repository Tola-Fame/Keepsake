import { NextResponse } from "next/server";
import { handleUpload, handleUploadPresigned, type HandleUploadBody, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { count, eq } from "drizzle-orm";
import { currentUser } from "@/auth";
import { blobAuth, blobMode, blobToken } from "@/lib/config";
import { getDb, schema } from "@/db";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, albumPrefix, getOwnedAlbum, getSharedAlbum } from "@/lib/server/albums";

const MAX_PHOTOS_PER_ALBUM = 1500;

/** Checks the uploader may add this file to this album (owner, or guest with an open share link). */
async function authorize(pathname: string, clientPayload: string | null) {
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
}

// Gives the browser short-lived permission to send one photo straight to Vercel Blob.
export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (blobMode() === "token") {
      const json = await handleUpload({
        body: body as HandleUploadBody,
        request: req,
        token: blobToken(),
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          await authorize(pathname, clientPayload);
          return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: true };
        },
      });
      return NextResponse.json(json);
    }
    // Stores connected without a token (BLOB_STORE_ID + Vercel OIDC) use presigned upload URLs.
    const json = await handleUploadPresigned({
      body: body as HandleUploadPresignedBody,
      request: req,
      // Only used to verify upload-completed callbacks, which this site does not request.
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY || "unused",
      getSignedToken: async (pathname, clientPayload) => {
        await authorize(pathname, clientPayload);
        const token = await issueSignedToken({
          ...blobAuth(),
          pathname,
          operations: ["put"],
          validUntil: Date.now() + 10 * 60 * 1000,
          allowedContentTypes: IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
        });
        return { token, urlOptions: { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: true } };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
