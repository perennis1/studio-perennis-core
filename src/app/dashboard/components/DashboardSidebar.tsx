"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  Library,
  User,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

export default function DashboardSidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}) {
  const router = useRouter();
  const { user, logout } = useUser();

  // TEMP: see exactly what sidebar gets
  console.log("DashboardSidebar user", user);

  const menuItems = [
    { icon: <Home size={22} />, label: "Overview", href: "/dashboard/overview" },
    { icon: <BookOpen size={22} />, label: "My Courses", href: "/dashboard/course" },
    { icon: <Library size={22} />, label: "Bookshelf", href: "/dashboard/bookshelf" },
     { icon: <Package size={22} />, label: "My Orders", href: "/dashboard/orders" }, // ✅ NEW
    { icon: <User size={22} />, label: "Profile", href: "/dashboard/profile" },
    { icon: <BarChart2 size={22} />, label: "Progress", href: "/dashboard/progress" },
    { icon: <Settings size={22} />, label: "Settings", href: "/dashboard/settings" },
    { icon: <HelpCircle size={22} />, label: "Support", href: "/dashboard/support" },
  ];

  const avatarSrc = user?.avatar || "/default-avatar.png";
  const displayName = user?.name || "User";

  const initials =
    displayName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between h-full 
        bg-[#2B2540] text-white border-r border-white/10 py-6
        transition-all duration-300 ease-in-out
        group hover:w-56 w-20
        rounded-tr-2xl rounded-br-3xl md:rounded-tr-[24px] `}
      >
        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-11 w-11 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
            {user?.avatar ? (
              <Image
                src={avatarSrc}
                alt="avatar"
                width={44}
                height={44}
                className="h-11 w-11 object-cover"
              />
            ) : (
              <span className="text-xs font-semibold">{initials}</span>
            )}
          </div>
          <h3 className="text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
            {displayName}
          </h3>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 mt-10 flex flex-col gap-6">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-4 mx-auto w-full px-6 py-2 text-sm
                hover:text-[#00E5FF] transition-all duration-300"
            >
              <span className="opacity-100">{item.icon}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex items-center gap-3 mx-auto px-6 py-2 text-sm text-red-400
            hover:text-red-300 transition-all duration-300"
        >
          <LogOut size={22} />
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300">
            Logout
          </span>
        </button>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#2B2540] md:hidden p-6
          transform transition-transform duration-300   
          rounded-tr-3xl rounded-br-3xl md:rounded-tr-[50px] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4"
        >
          <X size={26} />
        </button>

        {/* Avatar Mobile */}
        <div className="text-center mt-10">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-700 mx-auto flex items-center justify-center">
            {user?.avatar ? (
              <Image
                src={avatarSrc}
                alt="avatar"
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">{initials}</span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium">{displayName}</p>
        </div>

        {/* Menu Mobile */}
        <nav className="flex flex-col gap-6 mt-10">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              className="flex items-center gap-4 px-4 py-2 hover:text-[#00E5FF] transition"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex items-center gap-3 px-4 py-3 mt-auto text-red-400 hover:text-red-300"
        >
          <LogOut size={22} />
          Logout
        </button>
      </aside>
    </>
  );
}

