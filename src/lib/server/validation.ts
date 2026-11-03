import { z } from "zod";
import type { AlbumDoc } from "@/lib/types";

// Light structural validation; element details are rendered defensively on the client.
export const docSchema = z
  .object({
    version: z.literal(1),
    size: z.enum(["8x8", "10x10", "12x12", "11x8.5", "8.5x11", "a4", "a4-land"]),
    templateId: z.string().max(60),
    pages: z
      .array(
        z.object({
          id: z.string().max(40),
          background: z.object({ type: z.enum(["color", "gradient", "pattern"]) }).passthrough(),
          elements: z.array(z.object({ id: z.string().max(40), type: z.enum(["photo", "text", "sticker", "shape"]) }).passthrough()).max(200),
        }),
      )
      .min(1)
      .max(200),
  })
  .refine((d) => JSON.stringify(d).length < 3_000_000, "Album is too large")
  .transform((d) => d as unknown as AlbumDoc);

export const coverSchema = z.object({
  thumb: z.string().url().max(2000).nullable(),
  bg: z.string().max(40),
});
