//C:\Users\studi\my-next-app\src\app\admin\components\ControlButton.tsx


"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  label: string;
  href: string;
};

export default function ControlButton({ label, href }: Props) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-[#00ADB5]/70 bg-[#020617] px-4 py-1.5 text-xs font-medium text-slate-100 hover:bg-[#00ADB5]/10"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#00ADB5]" />
        {label}
      </Link>
    </motion.div>
  );
}
