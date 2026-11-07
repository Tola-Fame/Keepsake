import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, isNull, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentAdmin } from "@/lib/server/orders";
import { ORDER_STATUSES, orderNumber, statusInfo } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ status?: string; vendor?: string }> };

export default async function Page({ searchParams }: Props) {
  if (!(await currentAdmin())) return null;
  const { status, vendor } = await searchParams;
  const db = getDb();
  const filters: SQL[] = [];
  if (status && ORDER_STATUSES.some((s) => s.id === status)) filters.push(eq(schema.printOrders.status, status as OrderStatus));
  if (vendor === "none") filters.push(isNull(schema.printOrders.vendorId));
  else if (vendor) filters.push(eq(schema.printOrders.vendorId, vendor));

  const [orders, counts, vendors] = await Promise.all([
    db
      .select({
        id: schema.printOrders.id,
        number: schema.printOrders.number,
        title: schema.printOrders.title,
        quantity: schema.printOrders.quantity,
        status: schema.printOrders.status,
        shipping: schema.printOrders.shipping,
        createdAt: schema.printOrders.createdAt,
        vendorName: schema.vendors.name,
      })
      .from(schema.printOrders)
      .leftJoin(schema.vendors, eq(schema.printOrders.vendorId, schema.vendors.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.printOrders.createdAt))
      .limit(500),
    db.select({ status: schema.printOrders.status, n: count() }).from(schema.printOrders).groupBy(schema.printOrders.status),
    db.select({ id: schema.vendors.id, name: schema.vendors.name }).from(schema.vendors).orderBy(schema.vendors.name),
  ]);
  const countOf = (s: OrderStatus) => counts.find((c) => c.status === s)?.n ?? 0;
  const total = counts.reduce((a, c) => a + c.n, 0);
  const href = (p: { status?: string; vendor?: string }) => {
    const q = new URLSearchParams(Object.entries({ status, vendor, ...p }).filter(([, v]) => v) as [string, string][]);
    return `/admin/orders${q.size ? `?${q}` : ""}`;
  };

  return (
    <main>
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={href({ status: "" })} className={`rounded-full border px-3 py-1.5 text-sm ${!status ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/30"}`}>
          All <span className="opacity-70">{total}</span>
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s.id} href={href({ status: s.id })} className={`rounded-full border px-3 py-1.5 text-sm ${status === s.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/30"}`}>
            {s.label} <span className="opacity-70">{countOf(s.id)}</span>
          </Link>
        ))}
      </div>
      <form className="mt-3 flex flex-wrap items-center gap-2 text-sm" action="/admin/orders">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="vendor" className="text-muted">
          Vendor
        </label>
        <select id="vendor" name="vendor" defaultValue={vendor ?? ""} className="input w-auto py-1.5">
          <option value="">Any vendor</option>
          <option value="none">Not assigned</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <button className="btn-secondary py-1.5">Filter</button>
      </form>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-line bg-white p-10 text-center text-muted">No orders here yet.</p>
      ) : (
        <>
        {/* phones: one card per order */}
        <ul className="mt-6 space-y-3 md:hidden">
          {orders.map((o) => {
            const s = statusInfo(o.status);
            return (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="block rounded-3xl border border-line bg-white p-4 active:bg-paper">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-accent">{orderNumber(o.number)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>
                  </div>
                  <p className="mt-2 font-semibold">
                    {o.title} <span className="font-normal text-muted">× {o.quantity}</span>
                  </p>
                  <p className="mt-1 text-sm">
                    {o.shipping.name} <span className="text-muted">· {o.shipping.city}, {o.shipping.country}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {o.vendorName ?? "No vendor yet"} · placed {o.createdAt.toLocaleDateString()}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-line bg-white md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Book</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = statusInfo(o.status);
                return (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-accent hover:underline">
                        {orderNumber(o.number)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {o.title} <span className="text-muted">× {o.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      {o.shipping.name}
                      <span className="block text-xs text-muted">
                        {o.shipping.city}, {o.shipping.country}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3">{o.vendorName ?? <span className="text-muted">Not assigned</span>}</td>
                    <td className="px-4 py-3 text-muted">{o.createdAt.toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </main>
  );
}
