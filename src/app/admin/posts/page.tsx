"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type AdminPost = {
  id: number;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  deleted: boolean;
  deletedAt: string | null;
  category: string | null;
  type: string | null;
  views: number;
  _count: {
    likes: number;
    bookmarks: number;
    comments: number;
  };
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    if (!API_BASE) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/blogs/admin`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load posts");
      const data: AdminPost[] = await res.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function softDelete(id: number) {
    if (!API_BASE) return;
    if (!confirm("Soft delete this post? It will go to Trash.")) return;

    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/blogs/admin/${id}/soft`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to soft-delete post");
      await loadPosts();
    } catch (err: any) {
      setError(err.message || "Failed to soft-delete");
    } finally {
      setActionId(null);
    }
  }

  async function restore(id: number) {
    if (!API_BASE) return;
    if (!confirm("Restore this post from Trash?")) return;

    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/blogs/admin/${id}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to restore post");
      await loadPosts();
    } catch (err: any) {
      setError(err.message || "Failed to restore");
    } finally {
      setActionId(null);
    }
  }

  const active = posts.filter((p) => !p.deleted);
  const trash = posts.filter((p) => p.deleted);

  return (
    <div className="space-y-6 pt-60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Posts</h2>
          <p className="text-sm text-slate-400">
            Publish, archive, and restore blog posts.
          </p>
        </div>
        <button
          onClick={loadPosts}
          className="rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-400 hover:text-sky-200"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-300">Loading posts…</p>
      ) : (
        <>
          {/* Active posts */}
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Published & Drafts
            </h3>
            {active.length === 0 ? (
              <p className="text-xs text-slate-500">No posts yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#050712]">
                <table className="min-w-full text-left text-xs text-slate-200">
                  <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Stats</th>
                      <th className="px-4 py-2">Created</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-800/70 last:border-0 hover:bg-slate-900/40"
                      >
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-50">
                              {p.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              /blogs/{p.slug}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[11px] " +
                              (p.status === "PUBLISHED"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                                : "bg-amber-500/10 text-amber-300 border border-amber-400/40")
                            }
                          >
                            {p.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-300">
                          ❤️ {p._count.likes} · 🔖 {p._count.bookmarks} · 💬{" "}
                          {p._count.comments} · 👁 {p.views}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-2 text-right text-[11px]">
                          <button
                            onClick={() => softDelete(p.id)}
                            disabled={actionId === p.id}
                            className="rounded-full bg-red-500/15 px-3 py-1 text-[11px] text-red-300 hover:bg-red-500/25 disabled:opacity-60"
                          >
                            {actionId === p.id ? "Working…" : "Move to Trash"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Trash */}
          <section>
            <h3 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Trash
            </h3>
            {trash.length === 0 ? (
              <p className="text-xs text-slate-500">Trash is empty.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#080912]">
                <table className="min-w-full text-left text-xs text-slate-200">
                  <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Deleted At</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trash.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-800/70 last:border-0 hover:bg-slate-900/40"
                      >
                        <td className="px-4 py-2">
                          <span className="text-sm font-medium text-slate-50">
                            {p.title}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-400">
                          {p.deletedAt
                            ? new Date(p.deletedAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-2 text-right text-[11px]">
                          <button
                            onClick={() => restore(p.id)}
                            disabled={actionId === p.id}
                            className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60"
                          >
                            {actionId === p.id ? "Working…" : "Restore"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
