"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import IntelligenceMetricCard from "@/app/admin/components/IntelligenceMetricCard";

export default function BookIntelligencePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useUser();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`/api/admin/intelligence/books/${bookId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(setData);
  }, [bookId, user?.token]);

  if (!data) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-semibold">Book Intelligence</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <IntelligenceMetricCard
          label="Avg Session Depth"
          value={data.aggregates.avgSessionDepth}
          delta={data.aggregates.avgSessionDepthDelta}
          hint="Average pages reached per reading session"
        />

        <IntelligenceMetricCard
          label="Gate Friction"
          value={data.aggregates.avgGateFriction}
          delta={data.aggregates.avgGateFrictionDelta}
          hint="Reflection attempts before unlocking"
        />

        <IntelligenceMetricCard
          label="Reflection Density"
          value={data.aggregates.avgReflectionDensity}
          delta={data.aggregates.avgReflectionDensityDelta}
          hint="Reflections per 10 pages"
        />
      </div>

      <p className="text-slate-500">Sample size: {data.sampleSize}</p>
    </div>
  );
}
