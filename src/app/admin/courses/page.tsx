//C:\Users\studi\my-next-app\src\app\admin\courses\page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ---------------- TYPES ---------------- */

type AdminCourse = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  status: "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";
  level: string | null;
  durationMin: number | null;
  thumbnail: string | null;
  lessonsCount: number;
  createdAt: string;
};

const emptyForm = {
  title: "",
  slug: "",
  summary: "",
  level: "",
  durationMin: "",
  thumbnail: "",
};

/* ---------------- RULES ---------------- */

const canEdit = (c: AdminCourse) => c.status === "DRAFT";
const canDelete = (c: AdminCourse) => c.status === "DRAFT";
const canValidate = (c: AdminCourse) => c.status === "DRAFT";
const canPublish = (c: AdminCourse) => c.status === "READY";

/* ---------------- COMPONENT ---------------- */

export default function AdminCoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] =
    useState<AdminCourse | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);

  const authHeaders = () => ({
    Authorization: user?.token ? `Bearer ${user.token}` : "",
    "Content-Type": "application/json",
  });

  /* ---------------- DATA ---------------- */

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/courses`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const validateCourse = async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/courses/${id}/validate`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!data.ok) {
      alert("Validation failed:\n\n" + data.issues.join("\n"));
    }
    loadCourses();
  };

  const publishCourse = async (id: number) => {
    if (!confirm("Publish this course?")) return;
    await fetch(`${API_BASE}/admin/courses/${id}/publish`, {
      method: "POST",
      headers: authHeaders(),
    });
    loadCourses();
  };

  const archiveCourse = async (id: number) => {
    if (!confirm("Archive this course?")) return;
    await fetch(`${API_BASE}/admin/courses/${id}/archive`, {
      method: "POST",
      headers: authHeaders(),
    });
    loadCourses();
  };


/* ---------------- MODAL HELPERS ---------------- */

const openCreateModal = () => {
  setEditingCourse(null);
  setFormData({ ...emptyForm });
  setModalOpen(true);
};

const openEditModal = (course: AdminCourse) => {
  setEditingCourse(course);
  setFormData({
    title: course.title || "",
    slug: course.slug || "",
    summary: course.summary || "",
    level: course.level || "",
    durationMin: course.durationMin ? String(course.durationMin) : "",
    thumbnail: course.thumbnail || "",
  });
  setModalOpen(true);
};

const closeModal = () => {
  if (saving) return;
  setModalOpen(false);
  setEditingCourse(null);
  setFormData({ ...emptyForm });
  setError(null);
};

const handleChange = (
  field: keyof typeof emptyForm,
  value: string
) => {
  setFormData((prev) => ({ ...prev, [field]: value }));

  if (field === "title" && !editingCourse) {
    setFormData((prev) => ({
      ...prev,
      slug:
        prev.slug.trim() ||
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
    }));
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.token) return;

  setSaving(true);
  setError(null);

  try {
    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      summary: formData.summary.trim(),
      level: formData.level.trim() || null,
      durationMin: formData.durationMin
        ? Number(formData.durationMin)
        : null,
      thumbnail: formData.thumbnail.trim() || null,
    };

    const isEdit = !!editingCourse;
    const url = isEdit
      ? `${API_BASE}/admin/courses/${editingCourse.id}`
      : `${API_BASE}/admin/courses`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to save course");
    }

    await loadCourses();
    closeModal();
  } catch (err: any) {
    setError(err.message || "Failed to save course");
  } finally {
    setSaving(false);
  }
};

  /* ---------------- EARLY RETURN ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-400">
        Loading…
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */

  

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Courses Admin</h1>
            <p className="text-slate-400 text-sm mt-1">
              Structure first. Publish later.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl
                       bg-emerald-500 hover:bg-emerald-600
                       text-black font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Course
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -6 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden"
            >
              {/* THUMB */}
              <div className="relative h-40">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-800">
                    <ImageIcon className="w-8 h-8 text-slate-500" />
                  </div>
                )}

                {/* STATUS CHIP */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      course.status === "PUBLISHED"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {course.status}

                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="p-5 space-y-3">
                <h2 className="font-semibold">{course.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-3">
                  {course.summary || "No summary"}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.lessonsCount} lessons
                  </span>
                  <span>{course.level || "All levels"}</span>
                </div>

                {/* PRIMARY ACTION */}
               {canEdit(course) ? (
  <Link
    href={`/admin/courses/${course.id}/lessons`}
    className="block w-full text-center px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-sm font-semibold"
  >
    Manage Lessons →
  </Link>
) : (
  <div className="block w-full text-center px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400">
    Lessons locked
  </div>
)}

                {/* SECONDARY */}
                <div className="flex items-center justify-between mt-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-[11px] text-slate-400 hover:text-cyan-300"
                  >
                    Preview as learner
                  </Link>

                 <div className="flex flex-wrap gap-2 mt-3">
  {canValidate(course) && (
    <button
      onClick={() => validateCourse(course.id)}
      className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500"
    >
      Validate
    </button>
  )}

  {canPublish(course) && (
    <button
      onClick={() => publishCourse(course.id)}
      className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500"
    >
      Publish
    </button>
  )}

  {course.status === "PUBLISHED" && (
    <button
      onClick={() => archiveCourse(course.id)}
      className="px-3 py-1 text-xs rounded bg-amber-600 hover:bg-amber-500"
    >
      Archive
    </button>
  )}

  {canEdit(course) && (
    <button
      onClick={() => openEditModal(course)}
      className="px-3 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
    >
      Edit
    </button>
  )}

  {canDelete(course) && (
    <button
      onClick={() => handleDelete(course.id)}
      className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
    >
      Delete
    </button>
  )}
</div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL (UNCHANGED LOGIC) */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
           <motion.div
  initial={{ y: 30, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 20, opacity: 0 }}
  className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6"
  onClick={(e) => e.stopPropagation()}
>
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold">
      {editingCourse ? "Edit Course" : "Create Course"}
    </h2>
    <button
      onClick={closeModal}
      className="p-2 rounded-lg hover:bg-slate-800"
    >
      <X className="w-4 h-4" />
    </button>
  </div>

  <form onSubmit={handleSubmit} className="space-y-4">
    {/* TITLE */}
    <div>
      <label className="text-xs text-slate-400">Title</label>
      <input
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        required
        className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
      />
    </div>

    {/* SLUG */}
    <div>
      <label className="text-xs text-slate-400">Slug</label>
      <input
        value={formData.slug}
        onChange={(e) => handleChange("slug", e.target.value)}
        required
        className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
      />
    </div>

    {/* SUMMARY */}
    <div>
      <label className="text-xs text-slate-400">Summary</label>
      <textarea
        value={formData.summary}
        onChange={(e) => handleChange("summary", e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
      />
    </div>

    {/* LEVEL + DURATION */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-slate-400">Level</label>
        <input
          value={formData.level}
          onChange={(e) => handleChange("level", e.target.value)}
          className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400">Duration (minutes)</label>
        <input
          type="number"
          value={formData.durationMin}
          onChange={(e) => handleChange("durationMin", e.target.value)}
          className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
        />
      </div>
    </div>

    {/* THUMBNAIL */}
    <div>
      <label className="text-xs text-slate-400">Thumbnail URL</label>
      <input
        value={formData.thumbnail}
        onChange={(e) => handleChange("thumbnail", e.target.value)}
        className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2"
      />
    </div>

    {error && (
      <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm">
        {error}
      </div>
    )}

    {/* ACTIONS */}
    <div className="flex justify-end gap-3 pt-4">
      <button
        type="button"
        onClick={closeModal}
        disabled={saving}
        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
      >
        {saving ? "Saving…" : editingCourse ? "Update" : "Create"}
      </button>
    </div>
  </form>
</motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
