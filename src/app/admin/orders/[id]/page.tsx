import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb, schema } from "@/db";
import { currentAdmin } from "@/lib/server/orders";
import { orderNumber, statusInfo } from "@/lib/orders";
import { PAGE_SIZES } from "@/lib/pageSizes";
import OrderManager from "./OrderManager";
import BookFiles from "./BookFiles";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [o] = await getDb().select({ number: schema.printOrders.number }).from(schema.printOrders).where(eq(schema.printOrders.id, id));
  return { title: o ? orderNumber(o.number) : "Order" };
}

export default async function Page({ params }: Props) {
  if (!(await currentAdmin())) return null;
  const { id } = await params;
  const db = getDb();
  const [order] = await db.select().from(schema.printOrders).where(eq(schema.printOrders.id, id));
  if (!order) notFound();
  const [events, vendors, [customer]] = await Promise.all([
    db.select().from(schema.orderEvents).where(eq(schema.orderEvents.orderId, id)).orderBy(desc(schema.orderEvents.createdAt)),
    db.select().from(schema.vendors).orderBy(asc(schema.vendors.name)),
    db.select({ email: schema.users.email, name: schema.users.name }).from(schema.users).where(eq(schema.users.id, order.userId)),
  ]);
  const s = statusInfo(order.status);
  const a = order.shipping;
  const size = PAGE_SIZES[order.book.doc.size];
  const addressLines = [a.name, a.line1, a.line2, [a.city, a.region, a.postalCode].filter(Boolean).join(", "), a.country].filter(Boolean);

  return (
    <main>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">{orderNumber(order.number)}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${s.className}`}>{s.label}</span>
      </div>
      <p className="mt-1 text-muted">
        {order.title} · {order.quantity} {order.quantity === 1 ? "copy" : "copies"} · {size.label} ({size.description}) · {order.book.doc.pages.length} pages · placed {order.createdAt.toLocaleString()}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <BookFiles title={`${orderNumber(order.number)} ${order.title}`} doc={order.book.doc} photos={order.book.photos} />
          <section className="rounded-3xl border border-line bg-white p-5">
            <h2 className="panel-title">History</h2>
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="text-sm">
                  <p>{e.message}</p>
                  <p className="text-xs text-muted">
                    {e.actor} · {e.createdAt.toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-white p-5">
            <h2 className="panel-title">Ship to</h2>
            <address className="whitespace-pre-line text-sm not-italic">{addressLines.join("\n")}</address>
            <p className="mt-3 text-sm">
              <a href={`mailto:${a.email}`} className="font-semibold text-accent hover:underline">
                {a.email}
              </a>
              {a.phone && <span className="block text-muted">{a.phone}</span>}
            </p>
            {customer?.email && customer.email !== a.email && <p className="mt-2 text-xs text-muted">Account: {customer.email}</p>}
            {order.customerNotes && (
              <div className="mt-4 rounded-2xl bg-paper p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Customer note</p>
                <p className="mt-1 whitespace-pre-line">{order.customerNotes}</p>
              </div>
            )}
          </section>
          <OrderManager
            order={{
              id: order.id,
              status: order.status,
              vendorId: order.vendorId,
              price: order.price ?? "",
              trackingCarrier: order.trackingCarrier ?? "",
              trackingNumber: order.trackingNumber ?? "",
              trackingUrl: order.trackingUrl ?? "",
              adminNotes: order.adminNotes ?? "",
            }}
            vendors={vendors.map((v) => ({ id: v.id, name: v.name, active: v.active, email: v.email, phone: v.phone }))}
          />
        </div>
      </div>
    </main>
  );
}
