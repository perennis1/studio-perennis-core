"use client";

import { useState } from "react";

type Result = {
  allowed: boolean;
  reason?: string;
  gate?: any;
};

export default function AccessSimulatorPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/simulate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceType: "BOOK",
          resourceId: 1,
          page: 25,
          virtualUser: {
            owns: true,
            completedLessons: [],
            readingProgress: 0.12,
          },
        }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Curriculum Access Simulator</h1>

      <button
        onClick={runSimulation}
        disabled={loading}
        className="px-4 py-2 rounded bg-slate-800 text-sm"
      >
        {loading ? "Simulating…" : "Run Simulation"}
      </button>

      {result && (
        <pre className="bg-black/60 border border-slate-800 p-4 text-xs rounded">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
