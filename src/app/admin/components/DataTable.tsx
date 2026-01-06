//C:\Users\studi\my-next-app\src\app\admin\components\DataTable.tsx

"use client";

import { ReactNode } from "react";

type Props = {
  headers: string[];
  children: ReactNode; // table rows
};

export default function DataTable({ headers, children }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">{children}</tbody>
      </table>
    </div>
  );
}
