//C:\Users\studi\my-next-app\src\app\admin\inquiries\open\page.tsx


"use client";

import { useEffect, useState } from "react";

export default function OpenInquiriesPage() {
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/admin/inquiries/open", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(setThreads);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Open inquiry threads
      </h1>

      {threads.map(t => (
        <div key={t.id} className="border p-4 mb-4 rounded">
          <div className="font-medium">{t.title}</div>
          <div className="text-sm text-slate-500">
            User: {t.user.name ?? `#${t.user.id}`}
          </div>
        </div>
      ))}
    </div>
  );
}
