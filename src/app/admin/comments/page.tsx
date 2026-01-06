// src/app/admin/comments/page.tsx
"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type AdminComment = {
  id: number;
  content: string;
  createdAt: string;
  likeCount: number;
  pinned: boolean;
  user: { id: number; name: string | null; email: string };
  post: {  title: string; slug: string; id: number };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function loadComments() {
    if (!API_BASE) {
      setError("API base URL not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/blogs/admin/comments`, {
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Comments load failed:", res.status, res.statusText);
        throw new Error("Failed to load comments");
      }

      const data: AdminComment[] = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function pin(id: number, postId: number) {
    if (!API_BASE) return;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/blogs/${postId}/comments/${id}/pin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to pin comment");
      await loadComments();
    } catch (err: any) {
      setError(err.message || "Failed to pin");
    } finally {
      setActionId(null);
    }
  }

  async function unpin(id: number, postId: number) {
    if (!API_BASE) return;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/blogs/${postId}/comments/${id}/pin`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to unpin comment");
      await loadComments();
    } catch (err: any) {
      setError(err.message || "Failed to unpin");
    } finally {
      setActionId(null);
    }
  }

  async function remove(id: number, postId: number) {
    if (!API_BASE) return;
    if (!confirm("Delete this comment?")) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/blogs/${postId}/comments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete comment");
      }
      await loadComments();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    } finally {
      setActionId(null);
    }
  }

  const filteredComments = comments.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.content.toLowerCase().includes(q) ||
      (c.user.name || "").toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q) ||
      c.post.title.toLowerCase().includes(q) ||
      c.post.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pt-60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Comments</h2>
          <p className="text-sm text-slate-400">
            Review, pin, and remove comments across all posts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text, author, email, post…"
            className="w-60 rounded-full border border-slate-600 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={loadComments}
            className="rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-400 hover:text-sky-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-300">Loading comments…</p>
      ) : filteredComments.length === 0 ? (
        <p className="text-xs text-slate-500">
          {comments.length === 0
            ? "No comments yet."
            : "No comments match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#050712]">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-2">Post</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2">Meta</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-800/70 last:border-0 hover:bg-slate-900/40"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-50">
                        {c.post.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        /blogs/{c.post.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-slate-300">
                    <div className="flex flex-col">
                      <span>{c.user.name || `User ${c.user.id}`}</span>
                      <span className="text-[10px] text-slate-500">
                        {c.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-slate-100 max-w-xs">
                    <div className="line-clamp-3 whitespace-pre-wrap">
                      {c.content}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-slate-400">
                    <div>❤️ {c.likeCount}</div>
                    <div>
                      {c.pinned ? (
                        <span className="mt-1 inline-block rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-amber-200">
                          Pinned
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Not pinned
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      {new Date(c.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-right text-[11px] space-y-1">
                    <button
                      onClick={() =>
                        c.pinned
                          ? unpin(c.id, c.post.id)
                          : pin(c.id, c.post.id)
                      }
                      disabled={actionId === c.id}
                      className={
                        "block w-full rounded-full px-3 py-1 " +
                        (c.pinned
                          ? "bg-slate-800 text-amber-200 hover:bg-slate-700"
                          : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25") +
                        (actionId === c.id ? " opacity-60" : "")
                      }
                    >
                      {actionId === c.id
                        ? "Working…"
                        : c.pinned
                        ? "Unpin"
                        : "Pin"}
                    </button>
                    <button
                      onClick={() => remove(c.id, c.post.id)}
                      disabled={actionId === c.id}
                      className="block w-full rounded-full bg-red-500/15 px-3 py-1 text-red-300 hover:bg-red-500/25 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
