"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function AddReflectionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-gradient-to-b from-[#1B152D]/95 to-[#0A0A0A]/95 border border-white/10 rounded-3xl p-8 w-[90%] max-w-lg text-white shadow-2xl"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Add Reflection
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your insight or reflection..."
          className="w-full bg-transparent border border-white/20 rounded-xl p-4 text-sm h-32 focus:border-[#00ADB5] outline-none transition"
        />

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (text.trim()) onAdd(text.trim());
            }}
            className="px-4 py-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 rounded-xl transition"
          >
            Add
          </button>
        </div>
      </motion.div>
    </div>
  );
}
