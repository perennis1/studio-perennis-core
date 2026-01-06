"use client";

import { useMemo } from "react";

const scoreLabels = [
  "Too short",
  "Weak",
  "Medium",
  "Strong",
  "Excellent",
];

function getStrengthScore(password: string): number {
  if (!password || password.length < 6) return 0;
  let score = 1;
  if (password.length > 7) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function PasswordStrengthBar({ password }: { password: string }) {
  const score = useMemo(() => getStrengthScore(password), [password]);

  const colors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-orange-400",
    "bg-blue-400",
    "bg-green-500",
  ];

  return (
    <div className="w-full mt-2" aria-live="polite">
      <div className="flex h-2 w-full rounded overflow-hidden bg-white/30">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={"flex-1 mx-0.5 rounded transition-all " + (score > i ? colors[i] : "bg-gray-200/70")}
            style={{ opacity: score > i ? 1 : 0.3 }}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs text-center 
        ${score <= 1 ? "text-red-400" : score === 2 ? "text-yellow-400" : score === 3 ? "text-orange-400" : score === 4 ? "text-blue-400" : "text-green-400"}
      `}>
        {scoreLabels[score]}
      </p>
    </div>
  );
}
