"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";

export default function DashboardHeader({
  setMobileOpen,
}: {
  setMobileOpen: any;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useUser();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setMobileOpen(true)}>
        <Menu size={26} />
      </button>

      <h2 className="text-lg font-semibold">Dashboard</h2>

      {/* Avatar dropdown */}
      <div className="relative">
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full cursor-pointer border border-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        />

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-3 w-40 bg-[#111] border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#00ADB5]/20"
                onClick={() => (window.location.href = "/dashboard/profile")}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/20"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
