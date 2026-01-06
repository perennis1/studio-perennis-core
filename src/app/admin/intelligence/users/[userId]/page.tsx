"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import IntelligenceMetricCard from "@/app/admin/components/IntelligenceMetricCard";

export default function CrossSurfacePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.token) return;

    fetch(`/api/admin/intelligence/users/${userId}/cross-surface`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(setProfile);
  }, [userId, user?.token]);

  if (!profile) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-xl font-semibold">Cross-Surface Diagnostic</h1>

      {/* BOOKS */}
      <section>
        <h2 className="text-sm text-slate-400 mb-4">Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IntelligenceMetricCard
            label="Avg Session Depth"
            value={profile.books.avgSessionDepth}
            hint="Reading depth across books"
          />
          <IntelligenceMetricCard
            label="Gate Friction"
            value={profile.books.gateFriction}
            hint="Reflection resistance"
          />
          <IntelligenceMetricCard
            label="Reflection Density"
            value={profile.books.reflectionDensity}
            hint="Reflections per 10 pages"
          />
        </div>
      </section>

      {/* LESSONS */}
      <section>
        <h2 className="text-sm text-slate-400 mb-4">Lessons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IntelligenceMetricCard
            label="Watch Depth"
            value={profile.lessons.watchDepth}
            hint="% watched on average"
          />
          <IntelligenceMetricCard
            label="Completion Rate"
            value={profile.lessons.completionRate}
            hint="Lessons completed"
          />
          <IntelligenceMetricCard
            label="Rewatch Intensity"
            value={profile.lessons.rewatchIntensity}
            hint="Repeated engagement"
          />
        </div>
      </section>
    </div>
  );
}
