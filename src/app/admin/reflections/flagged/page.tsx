
//C:\Users\studi\my-next-app\src\app\admin\reflections\flagged\page.tsx



"use client";

import { useEffect, useState } from "react";

export default function FlaggedReflectionsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/admin/reflections/flagged", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(setItems);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Flagged reflections
      </h1>

      {items.map(r => (
        <div key={r.id} className="border p-4 mb-4 rounded">
          <div className="text-sm text-slate-500">
            User #{r.user.id} · {r.quality}
          </div>
          <div className="mt-2">{r.text}</div>
          <div className="mt-2 text-xs text-slate-400">
            Gate: {r.gate.question}
          </div>
        </div>
      ))}
    </div>
  );
}
