// src/app/courses/[slug]/lessons/[lessonSlug]/page.tsx
// src/app/courses/[slug]/lessons/[lessonSlug]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, PlayCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import LessonCommentsSection from "@/components/lesson/LessonCommentsSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type TimelineItem = {
  time: number;
  label: string;
};

type Lesson = {
  id: number;
  title: string;
  slug: string;
  body: string;
  videoUrl: string | null;
  durationSec?: number | null;
  timeline?: TimelineItem[] | null;
  course: {
    id: number;
    title: string;
    slug: string;
    authorId: number;
  };
};

export default function LessonPage() {
  const { slug, lessonSlug } = useParams<{
    slug: string;
    lessonSlug: string;
  }>();

  const { user } = useUser();
  const token = user?.token;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [locked, setLocked] = useState(false);
  const [lockedPayload, setLockedPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reflection
  const [reflection, setReflection] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflectionData, setReflectionData] = useState<any>(null);

  /* ---------------- LOAD LESSON ---------------- */

  useEffect(() => {
    const load = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${API_BASE}/courses/slug/${slug}/lessons/${lessonSlug}`,
          { headers }
        );

        const data = await res.json();

        if (data.locked) {
          setLocked(true);
          setLockedPayload(data);
          return;
        }

        setLesson(data);

        // Phase 8.1 — lesson open event
        if (data.id && token) {
          fetch(`${API_BASE}/lessons/${data.id}/open`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, lessonSlug, token]);

  /* ---------------- PROGRESS HEARTBEAT ---------------- */

  useEffect(() => {
    if (!lesson || !token || !iframeRef.current) return;

    let lastTime = 0;

    const tick = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1 }),
        "*"
      );
    };

    const handler = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data;

        if (data?.event === "infoDelivery" && data.info?.currentTime) {
          const current = Math.floor(data.info.currentTime);
          const delta = Math.max(0, current - lastTime);

          if (delta >= 15) {
            lastTime = current;

            fetch(`${API_BASE}/lessons/${lesson.id}/progress`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                positionSec: current,
                deltaSec: delta,
              }),
            }).catch(() => {});
          }
        }
      } catch {}
    };

    window.addEventListener("message", handler);
    intervalRef.current = setInterval(tick, 5000);

    return () => {
      window.removeEventListener("message", handler);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lesson, token]);

  /* ---------------- REFLECTION VISIBILITY ---------------- */

  useEffect(() => {
    if (!lesson || !token) return;

    fetch(`${API_BASE}/lessons/${lesson.id}/reflections`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setReflectionData)
      .catch(() => {});
  }, [lesson, token, completed]);

  /* ---------------- HELPERS ---------------- */

  const seekTo = (seconds: number, label?: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [seconds, true],
      }),
      "*"
    );

    if (token && lesson?.id) {
      fetch(`${API_BASE}/lessons/${lesson.id}/timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ second: seconds, label }),
      }).catch(() => {});
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading lesson…
      </div>
    );
  }

  if (locked && lockedPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Lock className="w-12 h-12 text-slate-500" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-red-400">Lesson not found.</div>;
  }

  const embedUrl = lesson.videoUrl
    ? lesson.videoUrl.replace("watch?v=", "embed/")
    : null;

  const timeline = Array.isArray(lesson.timeline) ? lesson.timeline : [];

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 md:px-20 py-28">
      {/* Header */}
      <section className="max-w-4xl mx-auto mb-10">
        <Link
          href={`/courses/${lesson.course.slug}`}
          className="text-cyan-400 text-sm flex items-center mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to course
        </Link>
        <h1 className="text-3xl font-semibold">{lesson.title}</h1>
      </section>

      {/* Video + Timeline */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        <div className="md:col-span-2">
          {embedUrl && (
            <div className="aspect-video rounded-3xl overflow-hidden">
              <iframe
                ref={iframeRef}
                src={`${embedUrl}?enablejsapi=1`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
          {lesson.body && (
            <div
              className="prose prose-invert mt-8"
              dangerouslySetInnerHTML={{ __html: lesson.body }}
            />
          )}
        </div>

        {timeline.length > 0 && (
          <aside className="p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold mb-4">Lesson Timeline</h3>
            <ul className="space-y-3">
              {timeline.map((t, i) => (
                <li key={i}>
                  <button
                    onClick={() => seekTo(t.time, t.label)}
                    className="flex gap-2 text-sm hover:text-white"
                  >
                    <PlayCircle className="w-4 h-4 text-cyan-400" />
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </section>

      {/* Reflection Visibility */}
      {reflectionData?.myReflection && (
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-xl font-semibold mb-3">Your reflection</h2>
          <p className="whitespace-pre-line text-slate-300">
            {reflectionData.myReflection.text}
          </p>
        </section>
      )}

      {/* Lesson Comments */}
      <LessonCommentsSection
        lessonId={lesson.id}
        authorId={lesson.course.authorId}
      />
    </div>
  );
}
