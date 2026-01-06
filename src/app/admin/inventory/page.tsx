//C:\Users\studi\my-next-app\src\app\admin\inventory\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

type InventoryRow = {
  warehouse: string;
  city?: string;
  book: string;
  variantType: string;
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
};

export default function AdminInventoryPage() {
  const { user } = useUser() as any;
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) return;

    fetch("http://localhost:5000/api/admin/inventory", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setRows(d.inventory || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user?.isAdmin) {
    return <div className="pt-28 text-center text-red-400">Admin only</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6">
      <h1 className="text-3xl font-semibold mb-6">Inventory Dashboard</h1>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-white/10 text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="p-2">Warehouse</th>
                <th className="p-2">Book</th>
                <th className="p-2">Variant</th>
                <th className="p-2">SKU</th>
                <th className="p-2">On hand</th>
                <th className="p-2">Reserved</th>
                <th className="p-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-2">{r.warehouse}</td>
                  <td className="p-2">{r.book}</td>
                  <td className="p-2">{r.variantType}</td>
                  <td className="p-2">{r.sku}</td>
                  <td className="p-2">{r.onHand}</td>
                  <td className="p-2 text-yellow-400">{r.reserved}</td>
                  <td
                    className={`p-2 ${
                      r.available <= 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {r.available}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
