

//C:\Users\studi\my-next-app\src\app\admin\page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import StatCard from "@/app/admin/components/StatCard";
import ControlButton from "@/app/admin/components/ControlButton";

type OverviewStats = {
  publishedPosts: number;
  activeReaders: number;
  pendingReviews: number;
};

const adminSections = [
  { label: "Dashboard", href: "/admin/dashboard", desc: "System overview & KPIs" },
  { label: "Blogs", href: "/admin/blogs", desc: "Write, edit, publish articles" },
  { label: "Comments", href: "/admin/comments", desc: "Moderate discussions" },
  { label: "Users", href: "/admin/users", desc: "User accounts & roles" },
  { label: "Analytics", href: "/admin/analytics", desc: "Traffic & reading stats" },
  { label: "Activity", href: "/admin/activity", desc: "System activity feed" },
  { label: "Books", href: "/admin/books", desc: "Books & curriculum" },
  { label: "Courses", href: "/admin/courses", desc: "Courses & lessons" },
  { label: "Inventory", href: "/admin/inventory", desc: "Stock & availability" },
  { label: "Ledger", href: "/admin/ledger", desc: "Financial records" },
  { label: "Reading Live", href: "/admin/reading/live", desc: "Live reader activity" },
  { label: "Reflections", href: "/admin/reflections", desc: "User reflections" },
  { label: "Reflection Insights", href: "/admin/reflections/insights", desc: "Quality analysis" },
  { label: "Suggestions", href: "/admin/reflections/suggestions", desc: "Gate suggestions" },
  { label: "Inquiries", href: "/admin/inquiries/open", desc: "Open user inquiries" },
  { label: "Settings", href: "/admin/settings", desc: "System configuration" },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/admin/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setStats(data);
    };

    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-semibold text-slate-50">
          Studio Perennis — Admin
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Central command for content, users, and intelligence.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Published Posts"
          value={stats?.publishedPosts ?? "—"}
          href="/admin/blogs"
        />
        <StatCard
          label="Active Readers"
          value={stats?.activeReaders ?? "—"}
          href="/admin/analytics"
        />
        <StatCard
          label="Pending Reviews"
          value={stats?.pendingReviews ?? "—"}
          href="/admin/reflections/flagged"
        />
      </div>

      {/* Quick Controls */}
      <section className="rounded-3xl border border-slate-800 bg-black/40 p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <ControlButton label="Write Post" href="/admin/blogs/new" />
          <ControlButton label="Add Book" href="/admin/books" />
          <ControlButton label="Add Course" href="/admin/courses" />
        </div>
      </section>

      {/* Admin Modules */}
      <section>
        <h2 className="text-sm font-semibold text-slate-200 mb-4">
          Admin modules
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-5 hover:border-sky-500/50 hover:bg-slate-900 transition"
            >
              <div className="text-base font-medium text-slate-100 group-hover:text-sky-300">
                {s.label}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {s.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
