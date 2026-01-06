// src/app/admin/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type AnalyticsSummary = {
  viewsLast7Days: number;
  totalUsers: number;
  publishedPosts: number;
  totalComments: number;
};

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    if (!API_BASE) {
      setError("API base URL not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // backend endpoint you can implement with real data or mocks
      const res = await fetch(`${API_BASE}/admin/analytics/summary`, {
        
      });
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json() as AnalyticsSummary;
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="space-y-6 pt-60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Analytics</h2>
          <p className="text-sm text-slate-400">
            High-level reading and engagement signals across Studio Perennis.
          </p>
        </div>

        <button
          onClick={loadSummary}
          className="rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-400 hover:text-sky-200"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          label="Views (last 7 days)"
          value={summary?.viewsLast7Days ?? "--"}
        />
        <AnalyticsCard
          label="Total users"
          value={summary?.totalUsers ?? "--"}
        />
        <AnalyticsCard
          label="Published posts"
          value={summary?.publishedPosts ?? "--"}
        />
        <AnalyticsCard
          label="Total comments"
          value={summary?.totalComments ?? "--"}
        />
      </div>

      {/* Chart placeholders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-[#050712] px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-2">
            Traffic · last 7 days
          </h3>
          <p className="text-[11px] text-slate-500">
            Chart placeholder. Later: line chart of daily views.
          </p>
          <div className="mt-3 h-40 rounded-xl border border-dashed border-slate-700 bg-slate-900/40" />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#050712] px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-2">
            Top posts by views
          </h3>
          <p className="text-[11px] text-slate-500">
            Chart placeholder. Later: bar chart of best-performing posts.
          </p>
          <div className="mt-3 h-40 rounded-xl border border-dashed border-slate-700 bg-slate-900/40" />
        </div>
      </div>
    </div>
  );
}

type CardProps = { label: string; value: number | string };

function AnalyticsCard({ label, value }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#050712] to-black px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,1)]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sky-300 mb-1">
        {label}
      </p>
      <div className="text-2xl font-semibold text-slate-50">{value}</div>
    </div>
  );
}



