"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminPost = {
  id: number;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  slug: string;
  type?: string | null;
};

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/blogs/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load posts");
        return res.json();
      })
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-slate-400">Loading…</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-28 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Blog Articles</h1>
            <p className="text-xs text-slate-400">Admin control</p>
          </div>

          <Link
            href="/admin/blogs/new"
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm"
          >
            + New Post
          </Link>
        </div>

        {posts.length === 0 && (
          <div className="border border-dashed border-slate-700 p-6 text-slate-400">
            No posts yet.
          </div>
        )}

        <div className="space-y-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex justify-between border border-slate-800 bg-slate-900 px-5 py-4 rounded-xl"
            >
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-slate-400">
                  {p.type ?? "Reflection"} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString("en-IN")}
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <span>{p.status}</span>
                <Link href={`/blogs/${p.slug}`}>View</Link>
                <Link href={`/admin/blogs/edit/${p.id}`}>Edit</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
