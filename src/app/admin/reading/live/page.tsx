//C:\Users\studi\my-next-app\src\app\admin\reading\live\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminLiveReadingPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.token) return;
    const res = await fetch(`${API_BASE}/admin/reading/live`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user?.token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-100">
        Live Reading Sessions
      </h1>

      {loading && (
        <p className="text-xs text-slate-400">Loading…</p>
      )}

      {!loading && sessions.length === 0 && (
        <p className="text-xs text-slate-400">
          No active readers right now.
        </p>
      )}

      {sessions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-800">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Book</th>
                <th className="p-2">Mode</th>
                <th className="p-2">Page</th>
                <th className="p-2">Boundary</th>
                <th className="p-2">Last Active</th>
                <th className="p-2">State</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.sessionId}
                  className={`border-t border-slate-800 ${
                    s.stalled ? "bg-amber-500/10" : ""
                  }`}
                >
                  <td className="p-2">
                    {s.user.name || s.user.email}
                  </td>
                  <td className="p-2">{s.book.title}</td>
                  <td className="p-2 text-center">{s.mode}</td>
                  <td className="p-2 text-center">
                    {s.lastSeenPage ?? "—"}
                  </td>
                  <td className="p-2 text-center">
                    {s.furthestAllowedPage ?? "—"}
                  </td>
                  <td className="p-2 text-center">
                    {new Date(s.lastActiveAt).toLocaleTimeString()}
                  </td>
                  <td className="p-2 text-center">
                    {s.stalled ? (
                      <Link
                        href={`/admin/inspect?userId=${s.user.id}&bookId=${s.book.id}`}
                        className="text-amber-400 underline"
                      >
                        Stalled
                      </Link>
                    ) : (
                      <span className="text-emerald-400">Reading</span>
                    )}
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
