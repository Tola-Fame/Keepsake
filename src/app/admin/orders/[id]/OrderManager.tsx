"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

interface OrderFields {
  id: string;
  status: OrderStatus;
  vendorId: string | null;
  price: string;
  trackingCarrier: string;
  trackingNumber: string;
  trackingUrl: string;
  adminNotes: string;
}

interface VendorOption {
  id: string;
  name: string;
  active: boolean;
  email: string | null;
  phone: string | null;
}

export default function OrderManager({ order, vendors }: { order: OrderFields; vendors: VendorOption[] }) {
  const router = useRouter();
  const [f, setF] = useState(order);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof OrderFields>(k: K, v: OrderFields[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setSaved(false);
  };
  const vendor = vendors.find((v) => v.id === f.vendorId);
  const shown = vendors.filter((v) => v.active || v.id === f.vendorId);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { id, ...fields } = f;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, note }) });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || "Could not save the order.");
      return;
    }
    setNote("");
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5 rounded-3xl border border-line bg-white p-5">
      <h2 className="panel-title !mb-0">Manage order</h2>
      <div>
        <label className="label" htmlFor="status">
          Status
        </label>
        <select id="status" className="input" value={f.status} onChange={(e) => set("status", e.target.value as OrderStatus)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">The customer sees: “{ORDER_STATUSES.find((s) => s.id === f.status)?.customer}”</p>
      </div>
      <div>
        <label className="label" htmlFor="vendor">
          Vendor
        </label>
        <select id="vendor" className="input" value={f.vendorId ?? ""} onChange={(e) => set("vendorId", e.target.value || null)}>
          <option value="">Not assigned</option>
          {shown.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {vendor && (vendor.email || vendor.phone) && (
          <p className="mt-1 text-xs text-muted">
            {vendor.email && (
              <a href={`mailto:${vendor.email}`} className="text-accent hover:underline">
                {vendor.email}
              </a>
            )}
            {vendor.email && vendor.phone && " · "}
            {vendor.phone}
          </p>
        )}
        {vendors.length === 0 && (
          <p className="mt-1 text-xs text-muted">
            No vendors yet.{" "}
            <Link href="/admin/vendors" className="font-semibold text-accent hover:underline">
              Add one
            </Link>
          </p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="price">
          Price (shown to customer)
        </label>
        <input id="price" className="input" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. $45 incl. shipping" maxLength={120} />
      </div>
      <fieldset className="space-y-3">
        <legend className="label">Tracking</legend>
        <input className="input" value={f.trackingCarrier} onChange={(e) => set("trackingCarrier", e.target.value)} placeholder="Carrier, e.g. DHL" aria-label="Carrier" maxLength={120} />
        <input className="input" value={f.trackingNumber} onChange={(e) => set("trackingNumber", e.target.value)} placeholder="Tracking number" aria-label="Tracking number" maxLength={200} />
        <input className="input" type="url" value={f.trackingUrl} onChange={(e) => set("trackingUrl", e.target.value)} placeholder="Tracking link (optional)" aria-label="Tracking link" maxLength={500} />
      </fieldset>
      <div>
        <label className="label" htmlFor="adminNotes">
          Team notes (private)
        </label>
        <textarea id="adminNotes" className="input min-h-20" value={f.adminNotes} onChange={(e) => set("adminNotes", e.target.value)} maxLength={5000} />
      </div>
      <div>
        <label className="label" htmlFor="note">
          Add to history (optional)
        </label>
        <input id="note" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sent print files to vendor" maxLength={2000} />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : saved ? <Check className="h-4 w-4" aria-hidden /> : null}
        {saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}
