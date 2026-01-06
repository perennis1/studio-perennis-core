
//C:\Users\studi\my-next-app\src\app\admin\components\AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
  // Intelligence (NEW)
  { href: "/admin/intelligence", label: "Intelligence" },
];

export default function AdminSidebar({ collapsed, setCollapsed }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname?.startsWith(href));

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 border-r border-slate-800 bg-[#020617]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-sky-300">
            Studio Perennis
          </p>
          <p className="text-sm text-slate-300">Admin Console</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800/80 text-xs"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                active
                  ? "bg-sky-500/10 text-sky-200 border border-sky-500/40"
                  : "text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  active ? "bg-sky-400" : "bg-slate-600 group-hover:bg-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile-only drawer toggle will live in layout/topbar; sidebar is desktop here */}
    </aside>
  );
}
