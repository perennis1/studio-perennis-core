"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function LessonIntelligenceIndex() {
  const { user } = useUser();
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.token) return;

    fetch("/api/admin/lessons", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons ?? d));
  }, [user?.token]);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-semibold">Lesson Intelligence</h1>

      <ul className="space-y-2 text-sm">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              href={`/admin/intelligence/lessons/${l.id}`}
              className="text-sky-400 hover:text-sky-300"
            >
              {l.title} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
