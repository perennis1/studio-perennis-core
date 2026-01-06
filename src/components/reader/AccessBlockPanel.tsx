"use client";

import Link from "next/link";

type AccessResult = {
  allowed: boolean;
  reason?: string;
  gate?: {
    id: string;
    pageNumber: number;
    question: string;
    minLength: number;
  };
};

export default function AccessBlockPanel({
  access,
}: {
  access: AccessResult;
}) {
  /* -------------------------------------------------- */
  /* OUTSIDE TIME WINDOW                                 */
  /* -------------------------------------------------- */
  if (access.reason === "OUTSIDE_READING_WINDOW") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Reading is closed</h1>
          <p className="text-slate-400 text-sm">
            This book can only be read during the scheduled window.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* CURRICULUM LOCK                                    */
  /* -------------------------------------------------- */
  if (access.reason === "CURRICULUM_LOCKED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Step locked</h1>
          <p className="text-slate-400 text-sm">
            You must complete the previous curriculum step first.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* REFLECTION GATE                                    */
  /* -------------------------------------------------- */
  if (access.gate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-6">
        <div className="max-w-xl w-full space-y-6">
          <h1 className="text-2xl font-semibold">
            Reflection required
          </h1>

          <p className="text-slate-300">
            {access.gate.question}
          </p>

          <p className="text-xs text-slate-500">
            Minimum {access.gate.minLength} characters
          </p>

          <Link
            href={`/reader/reflection/${access.gate.id}`}
            className="inline-block px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-medium"
          >
            Write reflection
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* FALLBACK (FAIL CLOSED)                              */
  /* -------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-slate-400">
      Access restricted.
    </div>
  );
}
