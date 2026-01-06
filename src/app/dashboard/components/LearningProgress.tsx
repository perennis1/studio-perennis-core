"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type LearningProgressProps = {
  courseTitle: string;
  progressPct: number;   // 0–100
  weeklyMinutes: number; // for now you can pass 0
  lessonsCompletedThisWeek: number;
};

export default function LearningProgress({
  courseTitle,
  progressPct,
  weeklyMinutes,
    lessonsCompletedThisWeek,
}: LearningProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // small delay so animation is visible
    const id = setTimeout(() => setAnimatedProgress(progressPct), 300);
    return () => clearTimeout(id);
  }, [progressPct]);

  const weeklyHours = (weeklyMinutes / 60).toFixed(1);

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.05 }}
    className="
      p-6 rounded-xl
      bg-white/5 backdrop-blur-2xl
      border border-white/10 shadow-xl
      text-white
    "
  >
    <h3 className="text-lg font-semibold">Learning Progress</h3>

    <p className="mt-1 text-gray-300 text-sm">{courseTitle}</p>

    <div className="mt-4 h-2 bg-white/10 rounded-lg overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${animatedProgress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-[#00ADB5] rounded-lg"
      />
    </div>

    <div className="text-right mt-2 text-sm font-medium text-[#00ADB5]">
      {animatedProgress}%
    </div>

    <div className="mt-4 text-xs text-gray-400 space-y-1">
      <div>
        Lessons completed this week:{" "}
        <span className="text-gray-200 font-medium">
          {lessonsCompletedThisWeek}
        </span>
      </div>
      <div>
        Time spent this week:{" "}
        <span className="text-gray-200 font-medium">
          {weeklyMinutes > 0 ? `${weeklyHours} hours` : "—"}
        </span>
      </div>
    </div>
  </motion.div>
);

}
