import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { currentUser } from "@/auth";
import { OPEN_STATUSES } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

/** The signed-in user if they are on the team (ADMIN_EMAILS), otherwise null. */
export async function currentAdmin() {
  const user = await currentUser();
  return user?.isAdmin ? user : null;
}

/** True when an album has a print order that is still being worked on. */
export async function hasOpenOrders(albumId: string) {
  const rows = await getDb()
    .select({ id: schema.printOrders.id })
    .from(schema.printOrders)
    .where(and(eq(schema.printOrders.albumId, albumId), inArray(schema.printOrders.status, OPEN_STATUSES)))
    .limit(1);
  return rows.length > 0;
}

export async function logOrderEvent(orderId: string, message: string, actor: string, status?: OrderStatus) {
  await getDb().insert(schema.orderEvents).values({ orderId, message, actor, status: status ?? null });
}

const text = (max: number) => z.string().trim().max(max);

export const shippingSchema = z.object({
  name: text(120).min(1, "Please enter the name for delivery."),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: text(40),
  line1: text(200).min(1, "Please enter the street address."),
  line2: text(200),
  city: text(120).min(1, "Please enter the city."),
  region: text(120),
  postalCode: text(40),
  country: text(120).min(1, "Please enter the country."),
});

export const statusSchema = z.enum(["new", "confirmed", "printing", "shipped", "delivered", "cancelled"]);

/** Optional text field; empty strings are stored as null. */
export const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullable()
    .optional();

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Please enter the vendor's name.").max(120),
  contactName: optText(120),
  email: optText(200),
  phone: optText(60),
  website: optText(300),
  notes: optText(5000),
  active: z.boolean().optional(),
});
