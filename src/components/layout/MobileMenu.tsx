//src/components/layout/MobileMenu.tsx

"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Sun, Moon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  navLinks: { href: string; label: string }[];
  openLogin: () => void;
  openRegister: () => void;
}

// Dummy theme changer for demonstration
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggleTheme };
}

export default function MobileMenu({
  isOpen,
  setIsOpen,
  navLinks,
  openLogin,
  openRegister,
}: MobileMenuProps) {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Courses submenu (shows on hover for desktop, on click on mobile)
  const [showCourses, setShowCourses] = useState(false);
  const coursesRef = useRef<HTMLDivElement>(null);

  // Detect outside click (closes submenu)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (coursesRef.current && !coursesRef.current.contains(e.target as Node)) {
        setShowCourses(false);
      }
    }
    if (showCourses) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCourses]);

  // Keyboard accessibility: ESC to close
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isOpen && e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          ref={menuRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#161a22]/95 to-[#1b1e26]/95 backdrop-blur-xl border-l-4 border-[#00ADB5]/70 px-6 py-7 space-y-4 shadow-lg overflow-y-auto flex flex-col"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="absolute top-5 right-6 text-white text-3xl focus:outline-none hover:text-[#00ADB5] z-60"
            tabIndex={0}
          >
            &times;
          </button>

          <nav className="flex flex-col items-center gap-2 mt-12 w-full">
            {navLinks.map((link) =>
              link.label === "Courses" ? (
                <div
                  key={link.href}
                  className="w-full relative"
                  ref={coursesRef}
                  // Show submenu on hover for large screens
                  onMouseEnter={() => setShowCourses(true)}
                  onMouseLeave={() => setShowCourses(false)}
                >
                  <button
                    className={`flex justify-between items-center w-full text-base font-medium uppercase tracking-wider py-3 rounded transition ${pathname.startsWith("/courses") ? "bg-[#00ADB5]/20 text-[#00ADB5]" : "text-white hover:text-[#00ADB5]"}`}
                    onClick={() => setShowCourses((s) => !s)}
                    aria-haspopup="true"
                    aria-expanded={showCourses}
                  >
                    Courses
                    <span className="ml-2 text-sm">{showCourses ? "▲" : "▼"}</span>
                  </button>
                  <AnimatePresence>
                    {showCourses && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-5 flex flex-col gap-1.5 bg-[#181d25]/90 p-2 rounded shadow-md mt-2 z-30 w-44 absolute left-0"
                        style={{ minWidth: "9rem" }}
                      >
                        <Link href="/courses/design" onClick={() => setIsOpen(false)}
                          className={`block py-2 px-2 rounded text-sm ${pathname === "/courses/design" ? "bg-[#00ADB5]/30 text-[#00ADB5]" : "text-white hover:text-[#00ADB5]"}`}>
                          Design
                        </Link>
                        <Link href="/courses/code" onClick={() => setIsOpen(false)}
                          className={`block py-2 px-2 rounded text-sm ${pathname === "/courses/code" ? "bg-[#00ADB5]/30 text-[#00ADB5]" : "text-white hover:text-[#00ADB5]"}`}>
                          Code
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full text-base font-medium uppercase tracking-wider transition py-3 rounded text-center 
                  ${pathname === link.href ? "bg-[#00ADB5]/20 text-[#00ADB5]" : "text-white hover:text-[#00ADB5]"}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="border-t border-white/10 my-5" />

          {user ? (
            <>
              <div className="flex items-center gap-4 mb-4 justify-center">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border border-gray-600"
                />
                <div>
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-white/20 py-3 rounded-lg hover:bg-white/10 transition text-center text-white font-semibold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-white/20 py-3 rounded-lg hover:bg-white/10 transition text-center text-white font-semibold"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={toggleTheme}
                  className="w-full border border-white/20 py-3 rounded-lg hover:bg-white/10 transition text-center flex items-center justify-center font-semibold gap-2"
                >
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    window.location.href = "/";
                  }}
                  className="w-full border border-red-400/20 py-3 text-red-400 rounded-lg hover:bg-red-500/10 transition text-center font-semibold"
                >
                  Logout
                </button>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center border border-white/20 px-4 py-3 mt-1 rounded-lg hover:bg-white/10 transition w-full text-white font-semibold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-3 w-full">
              <button
                onClick={openLogin}
                className="text-center border border-white/30 px-4 py-3 rounded-lg hover:bg-white/10 transition text-white font-semibold w-full"
              >
                Sign In
              </button>
              <button
                onClick={openRegister}
                className="text-center border border-[#00ADB5] px-4 py-3 rounded-lg hover:bg-[#00ADB5]/20 text-[#00ADB5] transition font-semibold w-full"
              >
                Sign Up
              </button>
              <button
                onClick={toggleTheme}
                className="w-full border border-white/20 py-3 rounded-lg hover:bg-white/10 transition text-center flex items-center justify-center font-semibold gap-2"
              >
                {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </button>
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center border border-white/20 px-4 py-3 rounded-lg hover:bg-white/10 transition text-white font-semibold"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
