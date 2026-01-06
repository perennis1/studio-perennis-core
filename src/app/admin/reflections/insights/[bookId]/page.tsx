"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ReflectionInsightsPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useUser();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`${API_BASE}/admin/reflection-insights/books/${bookId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((r) => r.json())
      .then(setItems);
  }, [bookId, user]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-semibold mb-6">
        Reflection Friction
      </h1>

      <div className="space-y-4 max-w-4xl">
        {items.map((g) => (
          <div
            key={g.gateId}
            className="border border-slate-800 rounded-2xl p-4 bg-slate-900/70"
          >
            <p className="italic text-slate-300 mb-2">
              “{g.question}”
            </p>

            <div className="flex justify-between text-xs text-slate-400">
              <span>
                Attempts: {g.total}
              </span>
              <span>
                Flagged: {g.flagged}
              </span>
              <span
                className={
                  g.frictionScore > 0.6
                    ? "text-red-400"
                    : "text-slate-400"
                }
              >
                Friction: {(g.frictionScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
