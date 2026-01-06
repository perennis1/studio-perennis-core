"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, BookOpen, Library, User, Settings, Power } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserWithToken } from "@/types";





const menuItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/books", label: "Bookshelf", icon: Library },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MobileDashboardMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserWithToken | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-5 right-5 bg-[#00ADB5] p-3 rounded-full shadow-xl z-50"
      >
        <Menu size={26} className="text-black" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dim Background */}
            <motion.div
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] rounded-t-3xl px-8 py-6 space-y-6 z-50"
            >
              {/* Close Btn */}
              <button className="absolute top-4 right-4" onClick={() => setIsOpen(false)}>
                <X size={26} className="text-gray-300" />
              </button>

              {/* User header */}
              {user && (
                <div className="flex items-center gap-3">
                  <img
                   
                    src={user.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border border-white/20"
                  />
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Menu Navigation */}
              <div className="grid grid-cols-3 gap-4 text-center">
                {menuItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#00ADB5] transition"
                  >
                    <Icon size={26} />
                    <span className="text-xs">{label}</span>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setIsOpen(false);
                  window.location.href = "/";
                }}
                className="w-full py-2 mt-4 text-red-400 font-medium border border-red-400/20 rounded-xl hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


