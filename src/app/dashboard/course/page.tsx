"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import {
  Play,
  Clock,
  ChevronRight,
  CheckCircle2,
  CircleDot,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type MyCourseItem = {
  courseId: number;
  progress: number; // 0–1
  course: {
    id: number;
    title: string;
    slug: string;
    level: string | null;
    summary: string | null;
    durationMin: number | null;
    lessonsCount: number;
  };
};

export default function MyCoursesPage() {
 const { user } = useUser();

  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<MyCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

 useEffect(() => {
  if (user?.token) {
    setToken(user.token);
  } else if (typeof window !== "undefined") {
    setToken(localStorage.getItem("token"));
  }
}, [user]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/me/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load courses");
        const data: MyCourseItem[] = await res.json();
        setItems(data);
      } catch {
        setError("Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  if (loading || token === null) {
    return <div className="text-slate-400 text-sm">Loading your courses…</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-slate-200 text-sm">
        You have not enrolled in any courses yet.{" "}
        <Link href="/courses" className="text-cyan-400 hover:underline">
          Browse all courses →
        </Link>
      </div>
    );
  }

  const getStatusBadge = (progress: number) => {
    if (progress >= 1) {
      return {
        label: "Completed",
        icon: <CheckCircle2 className="w-3 h-3" />,
        className:
          "bg-emerald-500/15 border-emerald-500/60 text-emerald-200",
      };
    }
    if (progress <= 0) {
      return {
        label: "Not started yet",
        icon: <CircleDot className="w-3 h-3" />,
        className: "bg-slate-800/80 border-slate-600 text-slate-200",
      };
    }
    const pct = Math.round(progress * 100);
    return {
      label: `${pct}% complete`,
      icon: <CheckCircle2 className="w-3 h-3" />,
      className: "bg-indigo-500/15 border-indigo-500/60 text-indigo-200",
    };
  };

  const getButtonLabel = (progress: number) => {
    if (progress >= 1) return "Review course";
    if (progress <= 0) return "Start course";
    return "Continue learning";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-xl font-semibold text-slate-100">My Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(({ course, progress }) => {
          const status = getStatusBadge(progress ?? 0);

          return (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-950/60 border border-slate-700/40 shadow-xl p-6 flex flex-col"
            >
              {/* Level pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/70 border border-slate-700/60 rounded-full text-[11px] text-slate-200 mb-3 w-fit">
                <Play className="w-3 h-3" />
                {course.level || "All levels"}
              </div>

              {/* Status pill */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border mb-4 w-fit ${status.className}`}
              >
                {status.icon}
                {status.label}
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">
                {course.title}
              </h2>
              <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1">
                {course.summary ||
                  "Keep building your thinking skills lesson by lesson."}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>{course.lessonsCount} lessons</span>
                {course.durationMin && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.durationMin} min
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push(`/courses/${course.slug}`)}
                className="mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:from-cyan-600 hover:to-purple-700 transition"
              >
                {getButtonLabel(progress ?? 0)}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
