import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, index } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type { AlbumCover, AlbumDoc, OrderBook, OrderStatus, ShippingAddress } from "@/lib/types";

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

// ---- Print orders ----
export const vendors = pgTable("vendor", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  contactName: text("contactName"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const printOrders = pgTable(
  "printOrder",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    number: integer("number").notNull().generatedAlwaysAsIdentity({ startWith: 1001 }),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    // the album may be edited or deleted later; `book` keeps exactly what was ordered
    albumId: text("albumId").references(() => albums.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    book: jsonb("book").$type<OrderBook>().notNull(),
    quantity: integer("quantity").notNull().default(1),
    shipping: jsonb("shipping").$type<ShippingAddress>().notNull(),
    customerNotes: text("customerNotes"),
    status: text("status").$type<OrderStatus>().notNull().default("new"),
    vendorId: text("vendorId").references(() => vendors.id, { onDelete: "set null" }),
    price: text("price"),
    trackingCarrier: text("trackingCarrier"),
    trackingNumber: text("trackingNumber"),
    trackingUrl: text("trackingUrl"),
    adminNotes: text("adminNotes"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("order_user_idx").on(t.userId), index("order_status_idx").on(t.status), index("order_album_idx").on(t.albumId)],
);

/** Order history shown to the team (and status changes shown to the customer). */
export const orderEvents = pgTable(
  "orderEvent",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("orderId").notNull().references(() => printOrders.id, { onDelete: "cascade" }),
    status: text("status").$type<OrderStatus>(),
    message: text("message").notNull(),
    actor: text("actor").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("order_event_order_idx").on(t.orderId)],
);
