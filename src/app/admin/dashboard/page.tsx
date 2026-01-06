
//C:\Users\studi\my-next-app\src\app\admin\dashboard\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

type DashboardData = {
  system: {
    activeReaders: number;
    reflectionFlags: number;
    lockedCurriculum: number;
  };
  content: {
    activeBooks: number;
    activeCourses: number;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const { user, logout } = useUser();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          logout();
          window.location.href = "/auth/login";
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load admin dashboard");
        }

        const json = await res.json();
        if (mounted) setData(json);
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Dashboard unavailable");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.token, logout]);

  /* -----------------------------
   * RENDER GATES (STEP 4 CORE)
   * ----------------------------- */

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-100">
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-400">Loading system state…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-100">
          Admin Dashboard
        </h1>

        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-xs text-sky-400 hover:text-sky-300"
        >
          Retry →
        </button>
      </div>
    );
  }

  if (
    data &&
    data.system.activeReaders === 0 &&
    data.content.activeBooks === 0 &&
    data.content.activeCourses === 0
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-100">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          No activity yet. This system has not recorded reading or course usage.
        </p>
        <p className="text-xs text-slate-500 mt-2">
    No active readers in the last 24h.
  </p>
      </div>
    );
  }

  /* -----------------------------
   * READY STATE
   * ----------------------------- */

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Live system state
        </p>
      </header>

      {/* SYSTEM */}
      <section>
        <SectionTitle title="System" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Metric
            label="Active readers"
            value={data!.system.activeReaders}
            emphasis="primary"
            action={{
              label: "View sessions",
              href: "/admin/reading/sessions",
            }}
          />

          <Metric
            label="Flagged reflections"
            value={data!.system.reflectionFlags}
            danger={data!.system.reflectionFlags > 0}
            action={{
              label: "Review",
              href: "/admin/reflections/flagged",
            }}
          />

          <Metric
            label="Curriculum locks"
            value={data!.system.lockedCurriculum}
            danger={data!.system.lockedCurriculum > 0}
            action={{
              label: "Inspect",
              href: "/admin/curriculum/locks",
            }}
          />
        </div>
      </section>

      {/* CONTENT */}
      <section>
        <SectionTitle title="Content" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <Metric
            label="Curriculum books"
            value={data!.content.activeBooks}
          />
          <Metric
            label="Courses"
            value={data!.content.activeCourses}
          />
        </div>
      </section>
    </div>
  );
}

/* -----------------------------
 * Components
 * ----------------------------- */

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-medium text-slate-300 mb-3">
      {title}
    </h2>
  );
}

function Metric({
  label,
  value,
  emphasis,
  danger,
  action,
}: {
  label: string;
  value: number;
  emphasis?: "primary";
  danger?: boolean;
  action?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-4 flex flex-col justify-between",
        emphasis
          ? "border-slate-600 bg-slate-900"
          : danger
          ? "border-red-500/40 bg-red-950/30"
          : "border-slate-800 bg-slate-950/60",
      ].join(" ")}
    >
      <div>
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p
          className={[
            "font-semibold",
            emphasis ? "text-3xl" : "text-2xl",
            danger ? "text-red-300" : "text-slate-200",
          ].join(" ")}
        >
          {value}
        </p>
      </div>

      {action && (
        <div className="mt-3">
          <Link
            href={action.href}
            className="inline-block text-xs text-sky-400 hover:text-sky-300"
          >
            {action.label} →
          </Link>
        </div>
      )}
    </div>
  );
}
