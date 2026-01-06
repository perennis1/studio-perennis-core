
//C:\Users\studi\my-next-app\src\app\admin\components\StatCard.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  label: string;
  value: number | string;
  trend?: string;
  href?: string;
  delay?: number;
};

export default function StatCard({ label, value, trend, href, delay = 0 }: Props) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-gradient-to-br from-[#111827] via-[#020617] to-black px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,1)]"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-sky-300 mb-1">
        {label}
      </p>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold text-slate-50">{value}</span>
        {trend && (
          <span className="text-[11px] text-emerald-300/90">{trend}</span>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
