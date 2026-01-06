"use client";

import DashboardSidebar from "@/app/dashboard/components/DashboardSidebar";
import DashboardTopbar from "@/app/dashboard/components/DashboardTopbar";
import { useState } from "react";
import UserGuard from "@/components/auth/UserGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserGuard>
      <div className="flex h-screen w-screen bg-[#0B0B12] text-white overflow-hidden">
        <DashboardSidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="flex flex-1 flex-col">
          <DashboardTopbar setMobileOpen={setMobileOpen} />

          <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#1A1A28] rounded-tl-3xl">
            {children}
          </main>
        </div>
      </div>
    </UserGuard>
  );
}
