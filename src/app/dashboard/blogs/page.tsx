"use client";
import Image from "next/image";

import { useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import { FaRegHeart, FaHeart, FaBookmark, FaRegBookmark, FaRegCommentDots, FaShareAlt } from "react-icons/fa";

const featuredBlogs = [
  {
    id: 1,
    title: "Are you a pig?",
    image: "/blogs/pig.jpg",
    excerpt: "A look at attention, identity, and the stories we adopt.",
    author: "Mashooq",
    date: "2025-09-21"
  },
  {
    id: 2,
    title: "Your only Home.",
    image: "/blogs/home.jpg",
    excerpt: "Exploring presence, belonging, and the roots of self.",
    author: "Mashooq",
    date: "2025-05-18"
  },
  {
    id: 3,
    title: "Distraction: Subtle art of escaping",
    image: "/blogs/distraction.jpg",
    excerpt: "Understanding attention, tech, and the creative mind.",
    author: "Ayesha",
    date: "2025-10-10"
  },
  {
    id: 4,
    title: "What is it to think?",
    image: "/blogs/think.jpg",
    excerpt: "Questioning, observing, and philosophical inquiry in daily life.",
    author: "Rohan",
    date: "2025-04-04"
  }
];

const blogVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      
      duration: 0.3, 
      delay: 0.1 
    } // ✅ "spring" is valid
  },
};


function BlogActions({ blogId }: { blogId: string | number }) {

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex gap-4 mt-3">
      <motion.button
        whileTap={{ scale: 1.2 }}
        title="Like"
        className="rounded-full p-2 hover:bg-[#00adb52c] transition"
        onClick={() => setLiked((prev) => !prev)}
      >
        {liked ? <FaHeart className="text-[#00ADB5] w-5 h-5" /> : <FaRegHeart className="text-white w-5 h-5" />}
      </motion.button>
      <motion.button
        whileTap={{ scale: 1.13 }}
        title="Comment"
        className="rounded-full p-2 hover:bg-[#00adb52c] transition"
        onClick={() => alert("Comments coming soon!")}
      >
        <FaRegCommentDots className="text-white w-5 h-5" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 1.13 }}
        title="Share"
        className="rounded-full p-2 hover:bg-[#00adb52c] transition"
        onClick={() => alert("Share modal coming soon!")}
      >
        <FaShareAlt className="text-white w-5 h-5" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 1.2 }}
        title="Save"
        className="rounded-full p-2 hover:bg-[#00adb52c] transition"
        onClick={() => setSaved((prev) => !prev)}
      >
        {saved ? <FaBookmark className="text-[#00ADB5] w-5 h-5" /> : <FaRegBookmark className="text-white w-5 h-5" />}
      </motion.button>
    </div>
  );
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0A0E12] pb-24 font-[Manrope]">
      <div className="max-w-3xl mx-auto px-4 pt-36">
        {/* HERO SECTION */}
        <div className="text-center pb-10">
          <h1 className="font-[clash] text-4xl md:text-5xl text-white mb-3">Studio Perennis Blog</h1>
          <p className="text-[#cfd8dc] text-lg mb-1">
            Insights, questions, and the journey of observation and consciousness.
          </p>
          <span className="text-[#00ADB5] text-base font-semibold">Pause. Reflect. Engage.</span>
        </div>

        {/* FEATURED BLOGS SLIDER */}
        <section className="mb-16">
          <Swiper
            effect="cards"
            grabCursor={true}
            navigation={true}
            initialSlide={0}
            modules={[EffectCards, Navigation]}
            className="max-w-lg mx-auto h-[375px] cardSwiper"
          >
            {featuredBlogs.map((blog) => (
              <SwiperSlide key={blog.id} className="pt-2 pb-6">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={blogVariants}
                  className="bg-[#181d25] shadow-xl rounded-xl overflow-hidden flex flex-col h-[340px]"
                >
                  {/* Image */}
                  <div className="relative h-40 w-full">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  </div>
                  {/* Card Content */}
                  <div className="flex flex-col justify-between flex-1 px-6 py-4">
                    <div>
                      <h2 className="font-[clash] text-xl text-white mb-1">{blog.title}</h2>
                      <p className="text-[#cfd8dc] text-sm mb-2">{blog.excerpt}</p>
                      <span className="text-xs text-[#00ADB5] font-medium">{blog.author} &mdash; {blog.date}</span>
                    </div>
                    <BlogActions blogId={blog.id} />
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* BLOG GRID (all posts) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial="hidden"
              whileInView="visible"
              variants={blogVariants}
              viewport={{ once: true, amount: 0.3 }}
              className="bg-[#181d25] shadow-lg p-5 rounded-xl flex flex-col justify-between"
            >
              <div className="relative h-36 w-full mb-3">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div>
                <h2 className="font-[clash] text-lg text-white mb-1">{blog.title}</h2>
                <p className="text-[#cfd8dc] text-sm mb-2">{blog.excerpt}</p>
                <span className="text-xs text-[#00ADB5] font-medium">{blog.author} &mdash; {blog.date}</span>
              </div>
              <BlogActions blogId={blog.id} />
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  );
}
