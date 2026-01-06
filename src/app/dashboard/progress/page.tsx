"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Flame, Star, Clock, BookOpen, CheckCircle2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ProgressStats = {
  totalCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  xp: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalMinutesLearned: number;
  level: number;
};

type CourseProgress = {
  courseId: number;
  title: string;
  slug: string;
  durationMin: number | null;
  progress: number; // 0–1
};

type ProgressResponse = {
  stats: ProgressStats;
  perCourse: CourseProgress[];
};

export default function ProgressPage() {
const { user } = useUser();

  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

useEffect(() => {
  if (user?.token) {
    setToken(user.token);
  } else if (typeof window !== "undefined") {
    const stored = localStorage.getItem("token");
    setToken(stored);
  } else {
    setToken(null);
  }
}, [user]);


  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/me/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load progress");
        const json: ProgressResponse = await res.json();
        setData(json);
      } catch {
        setError("Failed to load your progress.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  if (loading || token === null) {
    return <div className="text-slate-400 text-sm">Loading your progress…</div>;
  }

  if (error || !data) {
    return <div className="text-red-400 text-sm">{error ?? "Error"}</div>;
  }

  const { stats, perCourse } = data;

  return (
    <div className="flex flex-col gap-8 w-full">
      <h1 className="text-xl font-semibold text-slate-100">Your Progress</h1>

      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="Your level"
          value={`Level ${stats.level}`}
          sub={`${stats.xp} XP earned so far`}
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-yellow-400" />}
          label="Total XP"
          value={`${stats.xp} XP`}
          sub="Earn XP by completing lessons"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
          label="Lessons completed"
          value={String(stats.totalLessonsCompleted)}
          sub={`${stats.completedCourses}/${stats.totalCourses} courses finished`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-purple-400" />}
          label="Streak & time"
          value="Coming soon"
          sub="Streaks and minutes will appear here"
        />
      </div>

      {/* Per-course breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Course progress
        </h2>

        {perCourse.length === 0 && (
          <p className="text-sm text-slate-400">
            Enroll in a course to start seeing your progress here.
          </p>
        )}

        <div className="space-y-3">
          {perCourse.map((course) => {
            const pct = Math.round(course.progress * 100);
            const completed = pct >= 100;
            return (
              <button
                key={course.courseId}
                type="button"
                onClick={() => router.push(`/courses/${course.slug}`)}
                className="w-full text-left rounded-2xl bg-slate-900/70 border border-slate-700/60 px-5 py-4 hover:border-cyan-500/60 transition flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {course.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {course.durationMin
                        ? `${course.durationMin} min total`
                        : "Time estimate coming soon"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 font-medium">
                          Completed
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-300 font-medium">
                        {pct}% complete
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      completed
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                        : "bg-gradient-to-r from-cyan-400 to-purple-500"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
};

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-700/60 px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-slate-800/80">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            {label}
          </span>
          <span className="text-base font-semibold text-slate-50">
            {value}
          </span>
        </div>
      </div>
      {sub && <span className="text-[11px] text-slate-500 mt-1">{sub}</span>}
    </div>
  );
}
