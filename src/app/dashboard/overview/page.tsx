// src/app/dashboard/overview/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import WelcomeCard from "../components/WelcomeCard";
import LearningProgress from "../components/LearningProgress";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";

const API_BASE = "http://localhost:5000/api";

export default function OverviewPage() {
  const router = useRouter();
  const { user } = useUser();

  const [data, setData] = useState<any | null>(null);
  const [readingSummary, setReadingSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    user?.token ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // Load dashboard data
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/me/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setData(null);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  // Load reading summary
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/me/reading/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setReadingSummary)
      .catch(() => {});
  }, [token]);

  // ---- Render guards (AFTER hooks) ----
  if (loading) {
    return (
      <div className="text-slate-400 text-sm">
        Loading dashboard…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-red-400 text-sm">
        Dashboard failed to load.
      </div>
    );
  }

  const {
    enrollment,
    recentLessons,
    recentActivities,
    lessonsCompletedThisWeek,
    weeklyMinutes,
    streakDays,
    xp,
    level,
  } = data;

  const courseTitle = enrollment?.course?.title ?? "No active course";
  const progressPct = Math.round((enrollment?.progress ?? 0) * 100);

  const courseSlug = enrollment?.course?.slug;
  const lastLessonSlug = recentLessons?.[0]?.lesson?.slug ?? null;

  const handleContinueCourse = () => {
    if (!courseSlug || !lastLessonSlug) return;
    router.push(`/courses/${courseSlug}/lessons/${lastLessonSlug}`);
  };

  const handleReviewLastLesson = () => {
    if (!courseSlug || !lastLessonSlug) return;
    router.push(
      `/courses/${courseSlug}/lessons/${lastLessonSlug}#ai-practice`
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="bg-[#5A5077]/30 rounded-[30px] p-8 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WelcomeCard
            // @ts-expect-error legacy component
            userName={user?.name ?? "Friend"}
            streakDays={streakDays ?? 0}
          />

          <LearningProgress
            courseTitle={courseTitle}
            progressPct={progressPct}
            weeklyMinutes={weeklyMinutes ?? 0}
            lessonsCompletedThisWeek={lessonsCompletedThisWeek ?? 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <QuickActions
            hasActiveCourse={!!enrollment}
            onContinueCourse={handleContinueCourse}
            onReviewLastLesson={handleReviewLastLesson}
          />

          <RecentActivity
            items={recentLessons ?? []}
            courseSlug={courseSlug}
            activities={recentActivities ?? []}
          />
        </div>

        <div className="mt-8">
          <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5">
            <h2 className="text-sm font-semibold text-slate-100 mb-2">
              Learning streak
            </h2>

            {streakDays > 0 ? (
              <p className="text-sm text-slate-200">
                🔥 {streakDays}-day streak. Keep it going.
              </p>
            ) : (
              <p className="text-sm text-slate-200">
                Start your first streak with one short lesson today.
              </p>
            )}

            <div className="mt-4">
              <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5">
                <h2 className="text-sm font-semibold text-slate-100 mb-2">
                  Your level
                </h2>
                <p className="text-sm text-slate-200">
                  🎖 Level {level ?? 1} · {xp ?? 0} XP earned.
                </p>
              </section>
            </div>

            {readingSummary && (
              <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 mt-6">
                <h2 className="text-sm font-semibold text-slate-100 mb-2">
                  Reading
                </h2>

                <p className="text-sm text-slate-200">
                  📘 {readingSummary.activeBooks} active ·{" "}
                  ✅ {readingSummary.completedBooks} completed
                </p>

                <p className="text-sm text-slate-400">
                  {readingSummary.pagesReadTotal} pages ·{" "}
                  {readingSummary.readingMinutesThisWeek} min this week
                </p>
              </section>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
