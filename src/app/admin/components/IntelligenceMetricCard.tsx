type Props = {
  label: string;
  value: number | null;
  delta?: number | null; // % change vs baseline
  hint?: string;
};

export default function IntelligenceMetricCard({
  label,
  value,
  delta,
  hint,
}: Props) {
  const isUp = delta != null && delta > 0;
  const isDown = delta != null && delta < 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>

      <div className="flex items-end gap-2">
        <p className="text-2xl font-semibold text-slate-100">
          {value != null ? value.toFixed(2) : "—"}
        </p>

        {delta != null && (
          <span
            className={[
              "text-xs font-medium",
              isUp && "text-emerald-400",
              isDown && "text-red-400",
              delta === 0 && "text-slate-400",
            ].join(" ")}
          >
            {isUp && "▲"}
            {isDown && "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {hint && (
        <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}
