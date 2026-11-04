import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { CheckCircle2, ExternalLink, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { currentUser } from "@/auth";
import { cloudEnabled } from "@/lib/config";
import { getDb, schema } from "@/db";
import { orderNumber, statusInfo } from "@/lib/orders";
import { PAGE_SIZES } from "@/lib/pageSizes";
import CancelOrder from "./CancelOrder";

export const metadata: Metadata = { title: "My orders" };

type Props = { searchParams: Promise<{ placed?: string }> };

export default async function Page({ searchParams }: Props) {
  if (!cloudEnabled()) redirect("/");
  const user = await currentUser();
  if (!user) redirect("/signin?next=/orders");
  const { placed } = await searchParams;
  const orders = await getDb().select().from(schema.printOrders).where(eq(schema.printOrders.userId, user.id)).orderBy(desc(schema.printOrders.createdAt));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">My orders</h1>
        {placed && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              <strong>Thank you! Order {orderNumber(Number(placed))} is in.</strong> We&apos;ll email you the price and delivery time to confirm before we print.
            </p>
          </div>
        )}
        {orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-line bg-white p-10 text-center">
            <Package className="mx-auto h-8 w-8 text-accent" aria-hidden />
            <p className="mt-3 font-display text-2xl font-bold">No orders yet</p>
            <p className="mt-2 text-muted">Open any book on your bookshelf and choose &quot;Order print&quot; to have it printed and shipped.</p>
            <Link href="/albums" className="btn-primary mt-6">
              Go to my bookshelf
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => {
              const s = statusInfo(o.status);
              return (
                <li key={o.id} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:flex-row">
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-l-sm rounded-r-md shadow ring-1 ring-black/5" style={{ background: o.book.cover.bg }}>
                    {o.book.cover.thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.book.cover.thumb} alt="" className="h-16 w-16 rounded object-cover ring-2 ring-white/80" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-bold">{o.title}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>
                    </div>
                    <p className="text-sm text-muted">
                      {orderNumber(o.number)} · {o.quantity} {o.quantity === 1 ? "copy" : "copies"} · {PAGE_SIZES[o.book.doc.size].label}, {o.book.doc.pages.length} pages · ordered {o.createdAt.toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm">{s.customer}</p>
                    {o.price && <p className="mt-1 text-sm text-muted">Price: {o.price}</p>}
                    {o.trackingNumber && (
                      <p className="mt-1 text-sm">
                        Tracking: {o.trackingCarrier ? `${o.trackingCarrier} ` : ""}
                        {o.trackingUrl ? (
                          <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
                            {o.trackingNumber} <ExternalLink className="h-3 w-3" aria-hidden />
                          </a>
                        ) : (
                          <span className="font-semibold">{o.trackingNumber}</span>
                        )}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      Shipping to {o.shipping.name}, {o.shipping.city}, {o.shipping.country}
                    </p>
                  </div>
                  {o.status === "new" && (
                    <div className="sm:self-start">
                      <CancelOrder id={o.id} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
