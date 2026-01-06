
//C:\Users\studi\my-next-app\src\app\admin\layout.tsx

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminTopbar from "@/app/admin/components/AdminTopbar";

const mobileNavItems = [
   { href: "/admin", label: "Overview", icon: "🏠" },
  { href: "/admin/blogs", label: "Blogs", icon: "📝" },
  { href: "/admin/comments", label: "Comments", icon: "💬" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/analytics", label: "Analytics", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div />;

  return (
    <AdminGuard>
      <div className="flex h-screen bg-[#050712] text-slate-50 pt-60 ">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Desktop sidebar (unchanged) */}
        <div className="hidden lg:block">
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Mobile slide-in sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-72 transform bg-[#050712] border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Studio Perennis</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-sky-500/20 border border-sky-500/40 text-sky-200"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col">
          {/* Mobile topbar with hamburger */}
          <div className="lg:hidden z-30 bg-[#050712]/95 backdrop-blur-xl border-b border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Studio Perennis</span>
              </div>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      mobileOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop topbar (your existing one) */}
         {/* Topbar on all screens */}
<div className="mt-14 lg:mt-0">
  <AdminTopbar />
</div>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#050712] via-[#050816] to-[#020617] p-4 md:p-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
