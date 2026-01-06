//C:\Users\studi\my-next-app\src\app\admin\error.tsx


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (error.message === "AUTH_EXPIRED") {
      router.replace("/auth/login");
    }
  }, [error, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">
          Admin system error
        </h2>

        <p className="text-sm text-slate-400">
          {error.message === "AUTH_EXPIRED"
            ? "Your session expired. Redirecting to login…"
            : "Something went wrong while loading admin data."}
        </p>

        {error.message !== "AUTH_EXPIRED" && (
          <button
            onClick={reset}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
