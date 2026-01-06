"use client";

import { motion } from "framer-motion";

const videos = [
  {
    id: "dQw4w9WgXcQ", // replace with your real YouTube video IDs
    title: "Understanding Bias",
  },
  {
    id: "YbJOTdZBX1g",
    title: "Clarity of Thought",
  },
  {
    id: "3fumBcKC6RE",
    title: "Precision & Perception",
  },
];

export default function RecentYoutube() {
  return (
    <section className="relative w-full py-20 bg-[#0A0E12] text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-semibold mb-12"
        >
          Recent <span className="text-[#00ADB5]">Videos</span>
        </motion.h2>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group rounded-2xl overflow-hidden shadow-lg hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-lg font-medium">{video.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
