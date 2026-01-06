"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const blogs = [
  {
    id: 1,
    title: "The Discipline of Thinking Clearly",
    description:
      "Clarity is not born of intellect alone but of silence within reasoning. Explore how disciplined reflection shapes intelligence.",
    image: 
     "/blog1.jpg", // place these images in public/
    slug: "the-discipline-of-thinking-clearly",
  },
  {
    id: 2,
    title: "Why Bias Is Not the Enemy",
    description:
      "Bias reveals the structure of our mind — the very pattern that defines perception. To understand bias is to understand oneself.",
    image: "/blog2.jpg",
    slug: "why-bias-is-not-the-enemy",
  },
  {
    id: 3,
    title: "Precision and the Art of Observation",
    description:
      "Precision is intelligence at work — it demands both emotional restraint and rational clarity. Here’s how to cultivate it.",
    image: "/blog3.jpg",
    slug: "precision-and-the-art-of-observation",
  },
];

export default function RecentBlogs() {
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
          Recent <span className="text-[#00ADB5]">Blogs</span>
        </motion.h2>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative bg-[#11161c] rounded-2xl overflow-hidden shadow-lg hover:shadow-[#00ADB5]/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative w-full h-56">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-6 text-left">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-[#00ADB5] transition-colors duration-300">
                  {blog.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {blog.description}
                </p>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="text-[#00ADB5] text-sm font-medium hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
