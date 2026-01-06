"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminCurriculumInspector() {
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const inspect = async () => {
    if (!user?.token) return;
    setLoading(true);
    setResult(null);

    const res = await fetch(
      `${API_BASE}/admin/inspect/lock?userId=${userId}&bookId=${bookId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-100">
        Curriculum Lock Inspector
      </h1>

      <div className="space-y-3">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
        />
        <input
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Book / Course ID"
          className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
        />
        <button
          onClick={inspect}
          className="px-4 py-2 rounded-xl bg-cyan-600 text-sm text-white"
        >
          Inspect
        </button>
      </div>

      {loading && (
        <p className="text-xs text-slate-400">Inspecting…</p>
      )}

      {result && (
        <pre className="text-xs bg-black/40 border border-slate-800 rounded-2xl p-4 text-slate-200 overflow-auto">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
