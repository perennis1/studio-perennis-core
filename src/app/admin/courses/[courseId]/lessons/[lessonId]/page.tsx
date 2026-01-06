 //C:\Users\studi\my-next-app\src\app\admin\courses\[courseId]\lessons\[lessonId]\page.tsx
 
 "use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type TimelineItem = {
  time: number;
  label: string;
};

type LessonEditorState = {
  title: string;
  slug: string;
  body: string;
  videoUrl: string;
  durationSec: string;
  timeline: TimelineItem[];
  thumbnail: string;
  isPreview: boolean;
};

export default function AdminLessonEditorPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = Number(params.courseId);
  const lessonId = Number(params.lessonId);

  const router = useRouter();
  const { user } = useUser();

  const [form, setForm] = useState<LessonEditorState>({
    title: "",
    slug: "",
    body: "",
    videoUrl: "",
    durationSec: "",
    timeline: [],
    thumbnail: "",
    isPreview: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    Authorization: user?.token ? `Bearer ${user.token}` : "",
    "Content-Type": "application/json",
  };

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    if (!courseId || !lessonId) return;
    loadLesson();
  }, [courseId, lessonId]);

  async function loadLesson() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/admin/courses/${courseId}/lessons/${lessonId}`,
        { headers }
      );

      if (!res.ok) throw new Error("Failed to load lesson");

      const data = await res.json();

      setForm({
        title: data.title ?? "",
        slug: data.slug ?? "",
        body: data.body ?? "",
        videoUrl: data.videoUrl ?? "",
        durationSec: data.durationSec
          ? String(data.durationSec)
          : "",
        timeline: Array.isArray(data.timeline)
          ? data.timeline
          : [],
        thumbnail: data.thumbnail ?? "",
        isPreview: !!data.isPreview,
      });
    } catch (e: any) {
      setError(e.message || "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- SAVE ---------------- */

  async function saveLesson() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/admin/courses/${courseId}/lessons/${lessonId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            title: form.title.trim(),
            slug: form.slug.trim(),
            body: form.body,
            videoUrl: form.videoUrl || null,
            durationSec: form.durationSec
              ? Number(form.durationSec)
              : null,
            timeline: form.timeline,
            thumbnail: form.thumbnail || null,
            isPreview: form.isPreview,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-400">
        Loading lesson…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/courses/${courseId}/lessons`}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lessons
          </Link>

          <button
            onClick={saveLesson}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-emerald-500 hover:bg-emerald-600
                       text-black text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save lesson"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* META */}
        <div className="space-y-3">
          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
            placeholder="Lesson title"
            value={form.title}
            onChange={(e) =>
              setForm(f => ({
                ...f,
                title: e.target.value,
                slug:
                  f.slug ||
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
              }))
            }
          />

          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
            placeholder="Slug"
            value={form.slug}
            onChange={(e) =>
              setForm(f => ({ ...f, slug: e.target.value }))
            }
          />

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={form.isPreview}
              onChange={(e) =>
                setForm(f => ({
                  ...f,
                  isPreview: e.target.checked,
                }))
              }
            />
            Preview lesson (free)
          </label>
        </div>

        {/* VIDEO */}
        <div className="space-y-3">
          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
            placeholder="YouTube video URL"
            value={form.videoUrl}
            onChange={(e) =>
              setForm(f => ({ ...f, videoUrl: e.target.value }))
            }
          />

          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
            placeholder="Duration (seconds)"
            type="number"
            value={form.durationSec}
            onChange={(e) =>
              setForm(f => ({ ...f, durationSec: e.target.value }))
            }
          />
        </div>

        {/* TIMELINE */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">
            Timeline
          </h3>

          {form.timeline.map((t, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="number"
                className="w-24 rounded-xl bg-slate-800 border border-slate-700 px-2"
                value={t.time}
                onChange={(e) => {
                  const next = [...form.timeline];
                  next[idx].time = Number(e.target.value);
                  setForm(f => ({ ...f, timeline: next }));
                }}
              />
              <input
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3"
                value={t.label}
                onChange={(e) => {
                  const next = [...form.timeline];
                  next[idx].label = e.target.value;
                  setForm(f => ({ ...f, timeline: next }));
                }}
              />
              <button
                onClick={() =>
                  setForm(f => ({
                    ...f,
                    timeline: f.timeline.filter((_, i) => i !== idx),
                  }))
                }
                className="p-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={() =>
              setForm(f => ({
                ...f,
                timeline: [...f.timeline, { time: 0, label: "" }],
              }))
            }
            className="inline-flex items-center gap-1 text-sm text-cyan-400"
          >
            <Plus className="w-4 h-4" />
            Add timeline item
          </button>
        </div>

        {/* BODY */}
        <textarea
          rows={10}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3"
          placeholder="Lesson content"
          value={form.body}
          onChange={(e) =>
            setForm(f => ({ ...f, body: e.target.value }))
          }
        />

        {/* THUMBNAIL */}
        <input
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
          placeholder="Thumbnail URL"
          value={form.thumbnail}
          onChange={(e) =>
            setForm(f => ({ ...f, thumbnail: e.target.value }))
          }
        />

      </div>
    </div>
  );
}
