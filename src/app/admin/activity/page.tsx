"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

type ActivityEvent = {
  id: number;
  createdAt: string;
  userId: number;
  entityType: string;
  entityId: number;
  action: string;
  metadata?: Record<string, any> | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminActivityPage() {
  const { user } = useUser();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/activity`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load activity");

        const data = await res.json();
        setEvents(data.events ?? []);
      } catch (e: any) {
        setError(e.message || "Activity unavailable");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.token]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">
          Activity Timeline
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Append-only system events
        </p>
      </header>

      {loading && (
        <p className="text-xs text-slate-400">Loading events…</p>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {!loading && events.length === 0 && (
        <p className="text-xs text-slate-500">
          No activity recorded yet.
        </p>
      )}

      {events.length > 0 && (
        <div className="space-y-2">
          {events.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs"
            >
              <div className="flex justify-between gap-4">
                <div className="text-slate-200">
                  <strong>{e.action}</strong>{" "}
                  <span className="text-slate-400">
                    {e.entityType}#{e.entityId}
                  </span>
                </div>

                <time className="text-slate-500 whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString()}
                </time>
              </div>

              <div className="mt-1 text-slate-500">
                userId: {e.userId}
              </div>

              {e.metadata && (
                <pre className="mt-2 rounded-lg bg-black/40 p-2 text-[11px] text-slate-400 overflow-x-auto">
{JSON.stringify(e.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
