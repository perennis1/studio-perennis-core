"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type Reflection = {
  id: string;
  book: { title: string };
  gate: { question: string };
  text: string;
  createdAt: string;
};

export default function MyReflectionsPage() {
  const { user } = useUser();
  const [items, setItems] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`${API_BASE}/me/reflections`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 p-8">
        Loading reflections…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-semibold mb-8">
        Your Reflections
      </h1>

      <div className="space-y-6 max-w-3xl">
        {items.map((r) => (
          <div
            key={r.id}
            className="border border-slate-800 rounded-2xl p-5 bg-slate-900/70"
          >
            <div className="text-xs text-slate-500 mb-2">
              {r.book.title} •{" "}
              {new Date(r.createdAt).toLocaleDateString()}
            </div>

            <p className="text-slate-400 mb-3 italic">
              {r.gate.question}
            </p>

            <div className="whitespace-pre-wrap text-slate-100">
              {r.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
