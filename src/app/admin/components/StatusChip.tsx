//C:\Users\studi\my-next-app\src\app\admin\components\StatusChip.tsx

"use client";

type Props = {
  status: "draft" | "published" | "trash" | string;
};

export default function StatusChip({ status }: Props) {
  const s = status.toLowerCase();

  if (s === "published")
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
        Published
      </span>
    );

  if (s === "draft")
    return (
      <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300 border border-sky-500/40">
        Draft
      </span>
    );

  if (s === "trash")
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300 border border-rose-500/40">
        Trash
      </span>
    );

  return (
    <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 border border-slate-600/60">
      {status}
    </span>
  );
}
