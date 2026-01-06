"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import CurriculumCharts from "@/app/admin/components/CurriculumCharts";

type CurriculumNode = {
  id: number;
  nodeIndex: number;
  avgEngagement?: number | null;
  avgReflectionLen?: number | null;
  frictionRate?: number | null;
  completionRate?: number | null;
  sampleSize: number;
};

export default function CurriculumIntelligencePage() {
  const { user } = useUser();

  const [type, setType] = useState<"COURSE" | "BOOK">("COURSE");
  const [curriculumId, setCurriculumId] = useState("");
  const [data, setData] = useState<CurriculumNode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.token || !curriculumId) return;

    setLoading(true);
    setError(null);

    fetch(
      `/api/admin/intelligence/curriculum?type=${type}&id=${curriculumId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load curriculum intelligence");
        return r.json();
      })
      .then((json) => {
        setData(json.nodes ?? []);
      })
      .catch((err) => {
        setError(err.message || "Unavailable");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type, curriculumId, user?.token]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Curriculum Intelligence
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Curriculum type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          >
            <option value="COURSE">Course</option>
            <option value="BOOK">Book</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Curriculum ID
          </label>
          <input
            value={curriculumId}
            onChange={(e) => setCurriculumId(e.target.value)}
            placeholder="e.g. 1"
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm w-32"
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <p className="text-sm text-slate-400">
          Loading curriculum intelligence…
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Charts (Phase 11.6) */}
      {data && data.length > 0 && (
        <CurriculumCharts data={data} />
      )}

      {/* Data table */}
      {data && (
        <>
          {data.length === 0 ? (
            <p className="text-sm text-slate-500">
              No curriculum signals recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900">
                  <tr className="text-left text-slate-400">
                    <th className="px-3 py-2">Node</th>
                    <th className="px-3 py-2">Engagement</th>
                    <th className="px-3 py-2">Reflection Len</th>
                    <th className="px-3 py-2">Friction</th>
                    <th className="px-3 py-2">Completion</th>
                    <th className="px-3 py-2">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((n) => (
                    <tr
                      key={n.id}
                      className="border-t border-slate-800"
                    >
                      <td className="px-3 py-2">
                        {n.nodeIndex}
                      </td>
                      <td className="px-3 py-2">
                        {fmt(n.avgEngagement)}
                      </td>
                      <td className="px-3 py-2">
                        {fmt(n.avgReflectionLen)}
                      </td>
                      <td className="px-3 py-2">
                        {fmt(n.frictionRate)}
                      </td>
                      <td className="px-3 py-2">
                        {fmt(n.completionRate)}
                      </td>
                      <td className="px-3 py-2">
                        {n.sampleSize}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-slate-500">
        Snapshot-based. Values update only after recomputation.
      </p>
    </div>
  );
}

function fmt(v?: number | null) {
  return typeof v === "number" ? v.toFixed(2) : "—";
}
