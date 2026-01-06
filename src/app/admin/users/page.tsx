"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  postsCount?: number;
  commentsCount?: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function loadUsers() {
    if (!API_BASE) {
      setError("API base URL not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // adjust path if your backend uses /api/admin/users etc.
      const res = await fetch(`${API_BASE}/admin/users`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data: AdminUser[] = await res.json();                                  
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");                                   
    } finally {
      setLoading(false);                                                   
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleAdmin(user: AdminUser) {
    if (!API_BASE) return;
    if (
      !confirm(
        user.isAdmin
          ? "Remove admin privileges from this user?"
          : "Grant admin privileges to this user?",
      )
    )
      return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setActionId(user.id);
    setError(null);
    try {
      // adjust this route to match your backend
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const updated: AdminUser = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u)),
      );
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setActionId(null);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pt-60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Users</h2>
          <p className="text-sm text-slate-400">
            View members of Studio Perennis and manage admin access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-60 rounded-full border border-slate-600 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={loadUsers}
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
        <p className="text-sm text-slate-300">Loading users…</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-xs text-slate-500">
          {users.length === 0
            ? "No users found."
            : "No users match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#050712]">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Activity</th>
                <th className="px-4 py-2">Joined</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-800/70 last:border-0 hover:bg-slate-900/40"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-50">
                        {u.name || `User ${u.id}`}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-slate-400">
                    <div>Posts: {u.postsCount ?? 0}</div>
                    <div>Comments: {u.commentsCount ?? 0}</div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    {u.isAdmin ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-500/60 bg-slate-700/40 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-slate-200">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top text-right text-[11px]">
                    <button
                      onClick={() => toggleAdmin(u)}
                      disabled={actionId === u.id}
                      className={
                        "rounded-full px-3 py-1 " +
                        (u.isAdmin
                          ? "bg-slate-800 text-amber-200 hover:bg-slate-700"
                          : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25") +
                        (actionId === u.id ? " opacity-60" : "")
                      }
                    >
                      {actionId === u.id
                        ? "Working…"
                        : u.isAdmin
                        ? "Remove admin"
                        : "Make admin"}
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
