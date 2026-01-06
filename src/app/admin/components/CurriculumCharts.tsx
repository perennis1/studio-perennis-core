"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function CurriculumCharts({ data }: { data: any[] }) {
  const clean = data.filter((d) => d.nodeIndex != null);

  return (
    <div className="space-y-10">
      {/* Engagement */}
      <ChartBlock title="Engagement Curve">
        <LineChart data={clean}>
          <XAxis dataKey="nodeIndex" />
          <YAxis />
          <Tooltip />
          <Line dataKey="avgEngagement" strokeWidth={2} />
        </LineChart>
      </ChartBlock>

      {/* Reflection */}
      <ChartBlock title="Reflection Depth">
        <LineChart data={clean}>
          <XAxis dataKey="nodeIndex" />
          <YAxis />
          <Tooltip />
          <Line dataKey="avgReflectionLen" strokeWidth={2} />
        </LineChart>
      </ChartBlock>

      {/* Friction */}
      <ChartBlock title="Friction Heat">
        <BarChart data={clean}>
          <XAxis dataKey="nodeIndex" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="frictionRate" />
        </BarChart>
      </ChartBlock>

      {/* Completion */}
      <ChartBlock title="Completion Drop-off">
        <LineChart data={clean}>
          <XAxis dataKey="nodeIndex" />
          <YAxis />
          <Tooltip />
          <Line dataKey="completionRate" strokeWidth={2} />
        </LineChart>
      </ChartBlock>
    </div>
  );
}

function ChartBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 p-4 bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">
        {title}
      </h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
