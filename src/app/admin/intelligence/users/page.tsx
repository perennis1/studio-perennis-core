"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function UserIntelligenceIndex() {
  const { user } = useUser();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.token) return;

    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? d));
  }, [user?.token]);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-semibold">User Intelligence</h1>

      <ul className="space-y-2 text-sm">
        {users.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/intelligence/users/${u.id}`}
              className="text-sky-400 hover:text-sky-300"
            >
              {u.email} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
