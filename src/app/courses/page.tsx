//C:\Users\studi\my-next-app\src\app\courses\page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Users, ChevronRight, Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PublicCourse = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  level: string | null;
  lessonsCount: number;
  durationMin?: number | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<
    { courseId: number; progress: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses`);
        const data = await res.json();
        setCourses(data);

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (token) {
          const p = await fetch(`${API_BASE}/user/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (p.ok) {
            setEnrolledCourses(await p.json());
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.summary || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-28 px-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-semibold mb-3">Courses</h1>
        <p className="text-slate-400 max-w-2xl">
          Structured learning paths designed to build understanding, not just
          completion.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading &&
          filtered.map((course) => {
            const enrollment = enrolledCourses.find(
              (e) => e.courseId === course.id
            );
            const progress =
              enrollment && enrollment.progress > 0
                ? Math.round(enrollment.progress * 100)
                : null;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col"
              >
                {/* Title */}
                <h2 className="text-xl font-semibold mb-2">
                  {course.title}
                </h2>

                {/* Summary */}
                <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                  {course.summary || "Course overview coming soon."}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.lessonsCount} lessons
                  </span>
                  {course.durationMin && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.durationMin} min
                    </span>
                  )}
                  <span>{course.level || "All levels"}</span>
                </div>

                {/* Progress (quiet) */}
                {progress !== null && (
                  <div className="mb-4 text-xs text-emerald-400">
                    {progress}% completed
                  </div>
                )}

                {/* Action */}
                <Link
                  href={`/courses/${course.slug}`}
                  className="mt-auto inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                >
                  View course
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-slate-500 mt-20 text-center">
          No courses found.
        </div>
      )}
    </div>
  );
}
