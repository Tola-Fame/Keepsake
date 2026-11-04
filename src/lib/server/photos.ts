import "server-only";
import { head } from "@vercel/blob";
import { blobAuth } from "@/lib/config";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { uid } from "@/lib/doc";
import { toPhoto } from "./albums";

export const registerSchema = z.object({
  url: z.string().url().max(2000),
  thumbUrl: z.string().url().max(2000),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
});

/** Confirms both files exist in this project's Blob store under the given folder, then saves the photo. */
export async function registerPhoto(albumId: string, prefix: string, input: z.infer<typeof registerSchema>, uploadedBy: string | null) {
  const [full, thumb] = await Promise.all([head(input.url, blobAuth()).catch(() => null), head(input.thumbUrl, blobAuth()).catch(() => null)]);
  if (!full || !thumb || !full.pathname.startsWith(prefix) || !thumb.pathname.startsWith(prefix)) {
    throw new Error("Upload could not be verified");
  }
  const [row] = await getDb()
    .insert(schema.photos)
    .values({ id: uid(), albumId, url: full.url, thumbUrl: thumb.url, width: input.width, height: input.height, uploadedBy })
    .returning();
  return toPhoto(row);
}
