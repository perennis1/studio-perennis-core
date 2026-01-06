"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function GateSuggestionsPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useUser();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`${API_BASE}/admin/gate-suggestions/books/${bookId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(r => r.json())
      .then(setItems);
  }, [bookId, user]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-semibold mb-6">
        Gate Improvement Suggestions
      </h1>

      {items.length === 0 && (
        <p className="text-slate-400">
          No suggestions. Curriculum stable.
        </p>
      )}

      <div className="space-y-4 max-w-4xl">
        {items.map((s, i) => (
          <div
            key={i}
            className="border border-slate-800 rounded-2xl p-4 bg-slate-900/70"
          >
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold">
                {s.type.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
