"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Library,
  User,
  Settings,
  LifeBuoy,
  BarChart2,
  Power,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/books", label: "Bookshelf", icon: Library },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/analytics", label: "Progress", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();

  return (
    <aside className="hidden md:flex flex-col justify-between bg-[#2F2A3F] w-20 py-6 px-3 text-white">
      {/* Top Section */}
      <nav className="flex flex-col gap-8 items-center">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);

          return (
            <Link key={href} href={href} className="relative group">
              <div
                className={`p-3 rounded-xl transition-all 
                ${
                  active
                    ? "bg-[#00ADB5] text-black scale-110 shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={22} />
              </div>

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-14 top-1/2 -translate-y-1/2 
                bg-black text-white text-xs px-3 py-1 rounded-md 
                opacity-0 group-hover:opacity-100 
                whitespace-nowrap pointer-events-none"
              >
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Avatar + Logout */}
      <div className="space-y-4">
        {user && (
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="user"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <div>
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="p-3 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition"
          title="Logout"
        >
          <Power size={24} />
        </button>
      </div>
    </aside>
  );
}

