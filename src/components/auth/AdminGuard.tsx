// src/components/auth/AdminGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth"; // Changed from { useAuth } to useAuth (default import)

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user || !user.isAdmin) return null;

  return <>{children}</>;
}