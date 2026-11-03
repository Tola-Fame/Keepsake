import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, index } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type { AlbumCover, AlbumDoc } from "@/lib/types";

// ---- Auth.js tables ----
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// ---- App tables ----
export const albums = pgTable(
  "album",
  {
    id: text("id").primaryKey(),
    ownerId: text("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    occasion: text("occasion").notNull().default("other"),
    doc: jsonb("doc").$type<AlbumDoc>().notNull(),
    cover: jsonb("cover").$type<AlbumCover>().notNull(),
    shareToken: text("shareToken").unique(),
    shareEnabled: boolean("shareEnabled").notNull().default(false),
    allowGuestUploads: boolean("allowGuestUploads").notNull().default(false),
    allowDownload: boolean("allowDownload").notNull().default(true),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("album_owner_idx").on(t.ownerId)],
);

export const photos = pgTable(
  "photo",
  {
    id: text("id").primaryKey(),
    albumId: text("albumId").notNull().references(() => albums.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    thumbUrl: text("thumbUrl").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    uploadedBy: text("uploadedBy"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("photo_album_idx").on(t.albumId)],
);
