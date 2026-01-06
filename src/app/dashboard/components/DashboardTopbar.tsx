"use client";
import { useState } from "react";
import { Menu, Bell, Mail, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";

export default function DashboardTopbar({ 
  setMobileOpen 
}: { 
  setMobileOpen: (open: boolean) => void 
}) {
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useUser();

  return (
    <header className="
      w-full bg-[#0F0D25]/90 backdrop-blur-xl
      border-b border-white/10 px-4 md:px-8 py-4
      flex items-center justify-between relative
      rounded-b-2xl md:rounded-b-[50px]
    ">
      {/* ✅ Mobile Menu Toggle */}
      <button
        className="md:hidden flex items-center justify-center w-10 h-10
        bg-[#1B1838] rounded-lg hover:bg-[#26224A] transition"
       onClick={() => setMobileOpen(true)}

      >
        <Menu size={22} className="text-white" />
      </button>

      {/* ✅ Title (Desktop Only) */}
      <h1 className="hidden md:block text-lg font-semibold tracking-wide">
        DASHBOARD
      </h1>

      {/* ✅ Main Actions */}
      <div className="flex items-center gap-4 ml-auto relative">
        {/* ✅ Search Expand Button */}
        <div className="relative flex items-center">
          <button
            className="w-9 h-9 flex items-center justify-center hover:text-[#00E0D0] transition"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={22} />
          </button>
          {/* ✅ Search Expandable Input */}
          <AnimatePresence>
            {showSearch && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                type="text"
                placeholder="Search..."
                className="
                  absolute right-10 text-sm px-3 py-2 rounded-lg
                  bg-[#1B1838] text-white border border-white/10 
                  outline-none placeholder-gray-400
                "
                autoFocus
                onBlur={() => setShowSearch(false)} // ✅ Close when losing focus
              />
            )}
          </AnimatePresence>
        </div>

        {/* ✅ Notification */}
        <button className="hover:text-[#00E0D0] transition">
          <Bell size={22} />
        </button>

        {/* ✅ Messages */}
        <button className="hover:text-[#00E0D0] transition">
          <Mail size={22} />
        </button>

        {/* ✅ Avatar (NO sidebar toggle) */}
        <button
          className="w-9 h-9 rounded-full overflow-hidden border border-white/20"
          title="Profile"
        >
          <img 
            src={user?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
