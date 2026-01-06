"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";


const words = ["CLARITY", "BIAS", "PRECISION", "REASON", "INSIGHT"];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [paused, setPaused] = useState(false);

  // Parallax + scroll animations
  const { scrollYProgress } = useScroll();

  // Background parallax
  const yImage = useTransform(scrollYProgress, [0, 1], [0, 200]);

  // Text fade + move down, fully gone after small scroll
  const opacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.10], [0, 100]);

  // Pause typewriter when faded out
  useEffect(() => {
    const unsubscribe = opacity.onChange((v) => setPaused(v < 0.3));
    return () => unsubscribe();
  }, [opacity]);

  // Typewriter animation (with pause control)
  useEffect(() => {
    if (paused) return;

    let timeout: NodeJS.Timeout;
    const currentWord = words[index];
    let charIndex = 0;

    const type = () => {
      if (paused) return;
      if (charIndex <= currentWord.length) {
        setDisplayText(currentWord.slice(0, charIndex));
        charIndex++;
        timeout = setTimeout(type, 150);
      } else {
        timeout = setTimeout(erase, 1500);
      }
    };

    const erase = () => {
      if (paused) return;
      if (charIndex >= 0) {
        setDisplayText(currentWord.slice(0, charIndex));
        charIndex--;
        timeout = setTimeout(erase, 80);
      } else {
        setIndex((prev) => (prev + 1) % words.length);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [index, paused]);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden text-center text-white">
      {/* Parallax Background */}
      <motion.div
        style={{ y: yImage }}
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1.15, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
         
          src="/herobanner.jpg"
          alt="Studio Perennis Hero Banner"
          fill
          priority
          className="object-cover object-center brightness-[0.45]"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
      </motion.div>

      {/* Foreground Text */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <motion.h1
          style={{ opacity, y: translateY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="text-2xl md:text-5xl font-bold tracking-widest mb-10 font-playfair"
        >
          Developing Intelligence
        </motion.h1>

        <motion.p
          style={{ opacity, y: translateY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="text-3xl md:text-8xl font-semibold font-inter mb-5"
        >
          <span>{displayText}</span>
        </motion.p>
      </div>
    </section>
  );
}
