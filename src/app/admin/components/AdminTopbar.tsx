//C:\Users\studi\my-next-app\src\app\admin\components\AdminTopbar.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";

export default function AdminTopbar() {
  const { user, logout } = useUser();
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between border-b border-slate-800 bg-[#020617]/80 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs uppercase tracking-[0.25em] text-sky-300">
          Dashboard
        </span>
        <span className="text-sm text-slate-400">
          Overview & Control Center
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Search placeholder */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
          <span className="text-slate-500">⌕</span>
          <input
            type="text"
            placeholder="Search admin..."
            className="bg-transparent outline-none placeholder:text-slate-500 text-xs w-32"
          />
        </div>

        {/* Notifications placeholder */}
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          🔔
          {/* dot when there are notifications later */}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenProfile((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs"
          >
            <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-200">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </span>
            <span className="hidden sm:inline text-slate-200">
              {user?.name ?? "Admin"}
            </span>
          </button>

          <AnimatePresence>
            {openProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-40 rounded-xl border border-slate-700 bg-[#020617] text-xs shadow-lg z-50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-slate-800 text-slate-300">
                  Signed in as
                  <div className="text-slate-100 truncate">
                    {user?.email ?? "admin@perennis"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                  className="w-full px-3 py-2 text-left text-red-300 hover:bg-red-900/40"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
