
//C:\Users\studi\my-next-app\src\app\courses\[slug]\page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Lesson = {
  id: number;
  title: string;
  slug: string;
  order: number;
  isPreview: boolean;
  locked: boolean;
};

type Course = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  level: string | null;
  lessons: Lesson[];
  hasAccess: boolean;
  progress?: number;
};

export default function CourseDetailPage() {
  const { user } = useUser();
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const headers: HeadersInit = {};
        if (user?.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch(`${API_BASE}/courses/slug/${slug}`, {
          headers,
        });

        if (!res.ok) throw new Error("Course not found");

        const data = await res.json();
        setCourse(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, user?.token]);

  const handleCheckout = async () => {
    if (!course || !user?.token) return;

    const res = await fetch(
      `${API_BASE}/courses/${course.id}/checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    if (data.urlOrOrder?.url) {
      window.location.href = data.urlOrOrder.url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!course || error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error || "Course not found"}
      </div>
    );
  }

  const firstPlayableLesson = course.lessons.find(l => !l.locked);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-32 px-6">
      <div className="max-w-5xl mx-auto">

        {/* ==============================
            ORIENTATION HERO (C1)
        ============================== */}
        <section className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {course.title}
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mb-6">
            This course exists to correct habitual thinking errors that
            operate unnoticed in everyday reasoning.
          </p>

          <div className="border-l-4 border-cyan-500 pl-4 text-slate-400 max-w-3xl">
            <p>
              If you are looking for shortcuts, motivation, or surface-level
              explanations, this course is not for you.
            </p>
          </div>

          <div className="mt-10">
            {course.hasAccess && firstPlayableLesson ? (
              <Link
                href={`/courses/${course.slug}/lessons/${firstPlayableLesson.slug}`}
                className="inline-flex items-center gap-2 px-6 py-4 bg-emerald-600 rounded-xl font-semibold"
              >
                Continue Learning
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : user ? (
              <button
                onClick={handleCheckout}
                className="inline-flex items-center gap-2 px-6 py-4 bg-cyan-600 rounded-xl font-semibold"
              >
                Enroll in Course
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-4 bg-slate-800 rounded-xl"
              >
                Login to Enroll
              </Link>
            )}
          </div>
        </section>

        {/* ==============================
            WHY THIS COURSE EXISTS
        ============================== */}
        <section className="mb-20 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">
            Why this course exists
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Most people mistake information accumulation for understanding.
            This course intervenes at that fault line. It exposes how
            conclusions are formed prematurely, how assumptions go
            unquestioned, and how reasoning collapses under emotional
            attachment.
          </p>
        </section>

        {/* ==============================
            CAPABILITY OUTCOMES
        ============================== */}
        <section className="mb-20 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">
            What you will gain
          </h2>
          <ul className="list-disc list-inside text-slate-400 space-y-2">
            <li>Ability to notice faulty assumptions while thinking</li>
            <li>Capacity to pause before forming conclusions</li>
            <li>Clear separation between observation and interpretation</li>
            <li>Resistance to borrowed opinions</li>
          </ul>
        </section>

        {/* ==============================
            CURRICULUM (EARNED)
        ============================== */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8">
            Course Structure
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`border rounded-xl p-5 transition ${
                  lesson.locked
                    ? "border-slate-700 bg-slate-900/60 opacity-60"
                    : "border-cyan-500/40 bg-slate-900 hover:border-cyan-400"
                }`}
              >
                {lesson.locked ? (
                  <div className="flex items-center justify-between">
                    <span>{lesson.title}</span>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                ) : (
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    className="flex items-center justify-between"
                  >
                    <span>{lesson.title}</span>
                    {lesson.isPreview && (
                      <span className="text-xs text-cyan-400">
                        Preview
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
