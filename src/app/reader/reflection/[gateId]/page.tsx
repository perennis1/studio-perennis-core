"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ReflectionPage() {
  const { gateId } = useParams<{ gateId: string }>();
  const router = useRouter();

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reader/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateId,
          answerText: text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reflection rejected");
        return;
      }

      // Success → return to reader
      router.back();
    } catch {
      setError("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 pt-28">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          Reflection
        </h1>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Write your reflection here…"
          className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-600"
        />

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit reflection"}
        </button>
      </div>
    </div>
  );
}
