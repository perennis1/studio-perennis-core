"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function BookIntelligenceIndex() {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.token) return;

    fetch("/api/admin/books", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => setBooks(d.books ?? d));
  }, [user?.token]);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-semibold">Book Intelligence</h1>

      <ul className="space-y-2 text-sm">
        {books.map((b) => (
          <li key={b.id}>
            <Link
              href={`/admin/intelligence/books/${b.id}`}
              className="text-sky-400 hover:text-sky-300"
            >
              {b.title} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
