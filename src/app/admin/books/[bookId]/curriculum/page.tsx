"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CurriculumEditorPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useUser();
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch(
      `${API_BASE}/admin/curriculum/${bookId}`,
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );
    const data = await res.json();
    setSteps(data.steps || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.token) load();
  }, [user?.token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-100">
        Curriculum Flow
      </h1>

      {loading && (
        <p className="text-xs text-slate-400">Loading…</p>
      )}

      {!loading && steps.length === 0 && (
        <p className="text-xs text-slate-400">
          No curriculum steps defined.
        </p>
      )}

      {steps.length > 0 && (
        <table className="w-full text-xs border border-slate-800">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-2">Order</th>
              <th className="p-2">Type</th>
              <th className="p-2">Reference</th>
              <th className="p-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr
                key={s.id}
                className="border-t border-slate-800"
              >
                <td className="p-2 text-center">{s.order}</td>
                <td className="p-2 text-center">{s.type}</td>
                <td className="p-2 font-mono">{s.refId}</td>
                <td className="p-2 text-center">
                  {s.active ? "YES" : "NO"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
