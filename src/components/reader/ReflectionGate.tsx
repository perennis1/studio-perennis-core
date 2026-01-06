"use client";

import { useState } from "react";

type ReflectionGateProps = {
  gate: {
    id: string;
    pageNumber: number;
    question: string;
    minLength: number;
  };
  onSubmit: (text: string) => Promise<void>;
};

export default function ReflectionGate({
  gate,
  onSubmit,
}: ReflectionGateProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (text.trim().length < gate.minLength) {
      setError(`Minimum ${gate.minLength} characters required.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(text.trim());
    } catch (e: any) {
      setError(e.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 border border-slate-800 rounded-3xl bg-slate-950 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Reflection required
      </h2>

      <p className="text-slate-300 mb-6 leading-relaxed">
        {gate.question}
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Write your reflection here…"
        className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-4 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Minimum length: {gate.minLength} characters
        </span>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 rounded-xl bg-cyan-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit reflection"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
