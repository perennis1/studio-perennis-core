// app/dashboard/bookshelf/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

type BookshelfEntry = {
  bookId: number;
  format: "PDF" | "HARDCOPY";
  acquiredAt: string;
  book: {
    id: number;
    title: string;
    slug: string;
    author: string | null;
    coverImage: string | null;
  };
  reading: {
    state: "ACTIVE" | "COMPLETED" | "ABANDONED" | "LOCKED";
    lastSeenPage?: number | null;
    lastActiveAt?: string;
  };
};

function StateBadge({ state }: { state: BookshelfEntry["reading"]["state"] }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-500 text-black",
    COMPLETED: "bg-sky-500 text-black",
    ABANDONED: "bg-amber-500 text-black",
    LOCKED: "bg-slate-500 text-white",
  };

  return (
    <span
      className={`absolute top-3 right-3 text-xs px-2 py-1 rounded ${
        map[state]
      }`}
    >
      {state}
    </span>
  );
}

export default function BookshelfPage() {
  const { user, openAuthModal } = useUser() as any;
  const [entries, setEntries] = useState<BookshelfEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) {
      setEntries([]);
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/me/reading/bookshelf", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-black text-white pt-28 px-6">
      <h1 className="text-3xl font-semibold mb-8">Your Bookshelf</h1>

      {!user && (
        <button
          onClick={openAuthModal}
          className="text-sm text-emerald-400 underline"
        >
          Sign in to view your books
        </button>
      )}

      {user && loading && (
        <p className="text-sm text-gray-400">Loading your books…</p>
      )}

      {user && !loading && entries.length === 0 && (
        <p className="text-sm text-gray-400">
          You don’t own any books yet.
        </p>
      )}

      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((e) => (
            <div
              key={e.bookId}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="relative h-48 bg-black/30">
                {e.book.coverImage ? (
                  <Image
                    src={e.book.coverImage}
                    alt={e.book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-3xl">
                    📘
                  </div>
                )}

                <StateBadge state={e.reading.state} />
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h2 className="font-semibold">{e.book.title}</h2>
                  {e.book.author && (
                    <p className="text-xs text-gray-400">
                      by {e.book.author}
                    </p>
                  )}
                </div>

                <Link
                  href={`/reader/book/${e.bookId}`}
                  className="mt-2 inline-block rounded-xl bg-emerald-500 text-black py-2 text-center text-sm font-medium"
                >
                  {e.reading.state === "COMPLETED"
                    ? "Read again"
                    : "Continue reading"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
