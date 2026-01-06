"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function WelcomeCard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        col-span-2 p-6 rounded-xl 
        bg-white/5 backdrop-blur-2xl 
        border border-white/10 shadow-xl
        text-white
      "
    >
      <h2 className="text-3xl font-bold">
        Welcome back{user ? `, ${user.name.split(" ")[0]}!` : "!"}
      </h2>
      <p className="text-gray-300 mt-2 text-sm">
        Learning is a journey, not a destination.
      </p>

      {/* Streak Badge Placeholder */}
      <div className="mt-4 inline-flex items-center gap-2 bg-[#00ADB5]/20 text-[#00ADB5] px-3 py-1 rounded-full text-xs">
        🔥 Current streak: <span className="font-medium">5 days</span>
      </div>
    </motion.div>
  );
}
