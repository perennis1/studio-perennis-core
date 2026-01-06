"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";

export default function OAuthButtons({
  onGoogle,
  onApple,
  loadingProvider,
}: {
  onGoogle?: () => void;
  onApple?: () => void;
  loadingProvider?: "google" | "apple" | null;
}) {
  return (
    <div className="my-5 flex flex-col items-center space-y-3 w-full">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onGoogle}
        disabled={loadingProvider === "google"}
        className={`w-full flex items-center justify-center bg-white text-gray-800 font-semibold rounded-xl shadow hover:shadow-lg transition
          border border-gray-100 py-3 text-sm hover:bg-gray-50 duration-200 gap-2
          ${loadingProvider === "google" ? "opacity-60 cursor-not-allowed" : ""}
        `}
        aria-label="Sign in with Google"
      >
        <FcGoogle size={22} className="mr-2" />
        {loadingProvider === "google" ? "Signing in..." : "Continue with Google"}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onApple}
        disabled={loadingProvider === "apple"}
        className={`w-full flex items-center justify-center bg-black text-white font-semibold rounded-xl shadow hover:shadow-lg transition
          border border-gray-100 py-3 text-sm hover:bg-gray-900 duration-200 gap-2
          ${loadingProvider === "apple" ? "opacity-60 cursor-not-allowed" : ""}
        `}
        aria-label="Sign in with Apple"
      >
        <SiApple size={20} className="mr-2" />
        {loadingProvider === "apple" ? "Signing in..." : "Continue with Apple"}
      </motion.button>
      <div className="w-full flex items-center my-4">
        <div className="border-t border-gray-300 grow"></div>
        <span className="mx-2 text-xs text-gray-400">or</span>
        <div className="border-t border-gray-300 grow"></div>
      </div>
    </div>
  );
}
