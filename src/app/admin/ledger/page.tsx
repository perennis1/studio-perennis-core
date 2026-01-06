"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

type InventoryMismatch = {
  variantId: string;
  db: { onHand: number; reserved: number };
  ledger: { onHand: number; reserved: number };
};

type OrderMismatch = {
  orderId: number;
  dbStatus: string;
  ledgerStatus: string;
};

export default function AdminLedgerPage() {
  const { user } = useUser() as any;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<{
    ok: boolean;
    mismatches: InventoryMismatch[];
  } | null>(null);

  const [orders, setOrders] = useState<{
    ok: boolean;
    mismatches: OrderMismatch[];
  } | null>(null);

  const [actionResult, setActionResult] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ---------------- VERIFY ---------------- */
  const loadVerification = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/admin/ledger/verify", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setInventory(d.inventory);
        setOrders(d.orders);
      })
      .catch(() => setError("Failed to load ledger verification"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.isAdmin) loadVerification();
  }, [user]);

  /* ---------------- ACTIONS ---------------- */
  const callAction = async (url: string, body?: any) => {
    setActionLoading(true);
    setActionResult(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      setActionResult(data);
      loadVerification(); // refresh after mutation
    } catch {
      setActionResult({ error: "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- GUARDS ---------------- */
  if (!user?.isAdmin) {
    return (
      <div className="pt-28 text-center text-red-400">
        Admin access only
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-28 text-center text-slate-400">
        Verifying ledger…
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-8">
      <h1 className="text-3xl font-bold mb-8">
        Ledger Verification
      </h1>

      {/* ACTIONS */}
      <section className="mb-12 space-y-3">
        <h2 className="text-xl font-semibold">Actions</h2>

        <div className="flex gap-3 flex-wrap">
          <button
            disabled={actionLoading}
            onClick={() =>
              callAction("/api/admin/ledger/heal", { dryRun: true })
            }
            className="px-4 py-2 rounded bg-sky-600"
          >
            Dry-run auto-heal
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              callAction("/api/admin/ledger/heal", { dryRun: false })
            }
            className="px-4 py-2 rounded bg-emerald-600"
          >
            Apply auto-heal
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              callAction("/api/admin/ledger/cold-start", {
                confirm: "REBUILD",
              })
            }
            className="px-4 py-2 rounded bg-red-600"
          >
            Cold-start rebuild
          </button>
        </div>

        {actionResult && (
          <pre className="mt-4 bg-black/40 border border-white/10 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(actionResult, null, 2)}
          </pre>
        )}
      </section>

      {/* INVENTORY */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Inventory</h2>

        {inventory?.ok ? (
          <p className="text-emerald-400">✔ Inventory matches ledger</p>
        ) : (
          <div className="space-y-4">
            {inventory?.mismatches.map((m) => (
              <div
                key={m.variantId}
                className="border border-red-500/40 rounded-lg p-4"
              >
                <p className="font-mono text-sm">
                  Variant: {m.variantId}
                </p>
                <p className="text-sm text-red-300">
                  DB → onHand: {m.db.onHand}, reserved: {m.db.reserved}
                </p>
                <p className="text-sm text-emerald-300">
                  Ledger → onHand: {m.ledger.onHand}, reserved:{" "}
                  {m.ledger.reserved}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ORDERS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Orders</h2>

        {orders?.ok ? (
          <p className="text-emerald-400">✔ Orders match ledger</p>
        ) : (
          <div className="space-y-4">
            {orders?.mismatches.map((m) => (
              <div
                key={m.orderId}
                className="border border-red-500/40 rounded-lg p-4"
              >
                <p className="font-mono text-sm">
                  Order #{m.orderId}
                </p>
                <p className="text-sm text-red-300">
                  DB → {m.dbStatus}
                </p>
                <p className="text-sm text-emerald-300">
                  Ledger → {m.ledgerStatus}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
