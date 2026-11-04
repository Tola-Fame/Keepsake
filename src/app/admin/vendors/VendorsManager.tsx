"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Plus, X } from "lucide-react";

export interface VendorRow {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  active: boolean;
  openOrders: number;
}

type Draft = Omit<VendorRow, "id" | "openOrders">;

const EMPTY: Draft = { name: "", contactName: "", email: "", phone: "", website: "", notes: "", active: true };

const FIELDS: { key: Exclude<keyof Draft, "active" | "notes">; label: string; type?: string; required?: boolean }[] = [
  { key: "name", label: "Company name", required: true },
  { key: "contactName", label: "Contact person" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "website", label: "Website", type: "url" },
];

function VendorForm({ initial, id, onDone }: { initial: Draft; id?: string; onDone: () => void }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(id ? `/api/admin/vendors/${id}` : "/api/admin/vendors", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || "Could not save the vendor.");
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="label" htmlFor={`${id ?? "new"}-${f.key}`}>
            {f.label}
          </label>
          <input id={`${id ?? "new"}-${f.key}`} className="input" type={f.type ?? "text"} required={f.required} value={d[f.key]} onChange={(e) => setD({ ...d, [f.key]: e.target.value })} maxLength={300} />
        </div>
      ))}
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} />
        Taking new orders
      </label>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${id ?? "new"}-notes`}>
          Notes (prices, turnaround, paper, shipping regions…)
        </label>
        <textarea id={`${id ?? "new"}-notes`} className="input min-h-20" value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} maxLength={5000} />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {id ? "Save vendor" : "Add vendor"}
        </button>
        <button type="button" className="btn-ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function VendorsManager({ vendors }: { vendors: VendorRow[] }) {
  const [editing, setEditing] = useState<string | null>(vendors.length ? null : "new");

  return (
    <div className="mt-6 space-y-4">
      {editing === "new" ? (
        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="panel-title">New vendor</h2>
          <VendorForm initial={EMPTY} onDone={() => setEditing(null)} />
        </div>
      ) : (
        <button className="btn-primary" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" aria-hidden /> Add vendor
        </button>
      )}

      {vendors.map((v) =>
        editing === v.id ? (
          <div key={v.id} className="rounded-3xl border border-line bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="panel-title !mb-0">Edit {v.name}</h2>
              <button className="btn-ghost p-2" onClick={() => setEditing(null)} aria-label="Close">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <VendorForm id={v.id} initial={v} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <div key={v.id} className={`flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-start ${v.active ? "" : "opacity-60"}`}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-lg font-bold">{v.name}</p>
                {!v.active && <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">Paused</span>}
              </div>
              <p className="text-sm text-muted">
                {[v.contactName, v.email, v.phone].filter(Boolean).join(" · ") || "No contact details yet"}
                {v.website && (
                  <>
                    {" · "}
                    <a href={v.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Website
                    </a>
                  </>
                )}
              </p>
              {v.notes && <p className="mt-2 whitespace-pre-line text-sm">{v.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/orders?vendor=${v.id}`} className="btn-secondary">
                {v.openOrders} open {v.openOrders === 1 ? "order" : "orders"}
              </Link>
              <button className="btn-ghost p-2" onClick={() => setEditing(v.id)} aria-label={`Edit ${v.name}`}>
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
