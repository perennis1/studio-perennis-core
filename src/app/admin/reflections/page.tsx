//C:\Users\studi\my-next-app\src\app\admin\reflections\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

type FlaggedReflection = {
  id: string;
  userId: number;
  gateId: string;
  text: string;
  quality: string | null;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminFlaggedReflectionsPage() {
  const { user } = useUser();
  const [items, setItems] = useState<FlaggedReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/reflections/flagged`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load reflections");

        const data = await res.json();
        setItems(data.answers ?? []);
      } catch (e: any) {
        setError(e.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.token]);

  const review = async (
    id: string,
    decision: "APPROVED" | "REJECTED"
  ) => {
    if (!user?.token) return;

    await fetch(`${API_BASE}/admin/reflections/${id}/review`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision }),
    });

    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">
          Flagged Reflections
        </h1>
        <p className="text-xs text-slate-400">
          Manual review required
        </p>
      </header>

      {loading && (
        <p className="text-xs text-slate-400">Loading…</p>
      )}

      {error && (
        <div className="text-xs text-red-300">{error}</div>
      )}

      {!loading && items.length === 0 && (
        <p className="text-xs text-slate-500">
          No flagged reflections.
        </p>
      )}

      <div className="space-y-4">
        {items.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400">
                user {r.userId} · gate {r.gateId}
              </span>
              <span className="text-[11px] text-amber-400">
                {r.quality}
              </span>
            </div>

            <p className="text-sm text-slate-200 whitespace-pre-wrap mb-4">
              {r.text}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => review(r.id, "APPROVED")}
                className="px-3 py-1 rounded-xl bg-emerald-600/80 text-xs text-white"
              >
                Approve
              </button>
              <button
                onClick={() => review(r.id, "REJECTED")}
                className="px-3 py-1 rounded-xl bg-red-600/80 text-xs text-white"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
