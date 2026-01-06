"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import IntelligenceMetricCard from "@/app/admin/components/IntelligenceMetricCard";

export default function LessonIntelligencePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useUser();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`/api/admin/intelligence/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(setData);
  }, [lessonId, user?.token]);

  if (!data) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-xl font-semibold">Lesson Intelligence</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <IntelligenceMetricCard
          label="Watch Depth"
          value={data.aggregates.watchDepth}
          delta={data.aggregates.watchDepthDelta}
          hint="% of lesson watched"
        />

        <IntelligenceMetricCard
          label="Timeline Engagement"
          value={data.aggregates.timelineEngagement}
          delta={data.aggregates.timelineEngagementDelta}
          hint="Timeline interactions per minute"
        />

        <IntelligenceMetricCard
          label="Reflection Length"
          value={data.aggregates.avgReflectionLength}
          delta={data.aggregates.avgReflectionLengthDelta}
          hint="Average characters per reflection"
        />
      </div>

      <p className="text-slate-500">Sample size: {data.sampleSize}</p>
    </div>
  );
}
