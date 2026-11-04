import type { Metadata } from "next";
import { asc, count, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentAdmin } from "@/lib/server/orders";
import { OPEN_STATUSES } from "@/lib/orders";
import VendorsManager from "./VendorsManager";

export const metadata: Metadata = { title: "Vendors" };

export default async function Page() {
  if (!(await currentAdmin())) return null;
  const db = getDb();
  const [vendors, open] = await Promise.all([
    db.select().from(schema.vendors).orderBy(asc(schema.vendors.name)),
    db
      .select({ vendorId: schema.printOrders.vendorId, n: count() })
      .from(schema.printOrders)
      .where(inArray(schema.printOrders.status, OPEN_STATUSES))
      .groupBy(schema.printOrders.vendorId),
  ]);
  const openCount = (id: string) => open.find((o) => o.vendorId === id)?.n ?? 0;

  return (
    <main>
      <h1 className="font-display text-3xl font-bold">Vendors</h1>
      <p className="mt-2 max-w-2xl text-muted">The print partners who make and ship books. Assign each order to a vendor from the order page.</p>
      <VendorsManager
        vendors={vendors.map((v) => ({
          id: v.id,
          name: v.name,
          contactName: v.contactName ?? "",
          email: v.email ?? "",
          phone: v.phone ?? "",
          website: v.website ?? "",
          notes: v.notes ?? "",
          active: v.active,
          openOrders: openCount(v.id),
        }))}
      />
    </main>
  );
}
