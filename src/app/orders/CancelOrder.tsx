"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CancelOrder({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function cancel() {
    if (!confirm("Cancel this order?")) return;
    setBusy(true);
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).error || "Could not cancel the order.");
    setBusy(false);
  }
  return (
    <>
      <button onClick={cancel} disabled={busy} className="btn-ghost text-red-600 hover:bg-red-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Cancel order
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </>
  );
}
