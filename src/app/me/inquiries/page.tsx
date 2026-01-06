//C:\Users\studi\my-next-app\src\app\me\inquiries\page.tsx

"use client";

import { useEffect, useState } from "react";

export default function MyInquiriesPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/inquiries", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setThreads(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Open inquiries</h1>

      {threads.length === 0 && (
        <p className="text-slate-500">No open inquiries.</p>
      )}

      <ul className="space-y-4">
        {threads.map(thread => (
          <li key={thread.id} className="border p-4 rounded">
            <div className="font-medium">{thread.title}</div>
            <div className="text-sm text-slate-500">
              Last updated: {new Date(thread.updatedAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
