
//C:\Users\studi\my-next-app\src\app\admin\courses\[courseId]\lessons\page.tsx

// src/app/admin/courses/[courseId]/lessons/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Lesson = {
  id: number;
  title: string;
  slug: string;
  order: number;
  isPreview: boolean;
};

export default function AdminCourseLessonsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);

  const { user } = useUser();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

  const headers = {
    Authorization: user?.token ? `Bearer ${user.token}` : "",
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (!user?.token || Number.isNaN(courseId)) return;
    loadLessons();
  }, [courseId, user?.token]);

  async function loadLessons() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/admin/courses/${courseId}/lessons`,
        { headers }
      );

      if (!res.ok) {
        throw new Error("Failed to load lessons");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Invalid lessons payload:", data);
        setLessons([]);
        return;
      }

      setLessons(data);
    } catch (err) {
      console.error(err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }

  async function createLesson() {
    if (!title.trim()) return;

    setCreating(true);

    await fetch(`${API_BASE}/admin/courses/${courseId}/lessons`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        order: lessons.length + 1,
        isPreview: false,
      }),
    });

    setTitle("");
    setCreating(false);
    loadLessons();
  }

  async function deleteLesson(id: number) {
    if (!confirm("Delete this lesson?")) return;

    await fetch(
      `${API_BASE}/admin/courses/${courseId}/lessons/${id}`,
      { method: "DELETE", headers }
    );

    loadLessons();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/courses"
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-xl font-semibold">Lessons</h1>
        </div>

        {/* CREATE */}
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
          />
          <button
            onClick={createLesson}
            disabled={creating}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-slate-400">Loading lessons…</p>
        ) : lessons.length === 0 ? (
          <p className="text-slate-400">No lessons yet.</p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-4 py-3"
              >
                {/* 👇 THIS IS THE IMPORTANT PART */}
                <div>
                  <Link
                    href={`/admin/courses/${courseId}/lessons/${l.id}`}
                    className="font-medium text-cyan-400 hover:underline"
                  >
                    {l.title}
                  </Link>
                  <div className="text-xs text-slate-500">{l.slug}</div>
                </div>

                <button
                  onClick={() => deleteLesson(l.id)}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
