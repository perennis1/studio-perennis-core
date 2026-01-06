"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaLinkedin, FaInstagram, FaTwitter } from "react-icons/fa";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  setForm({ ...form, [e.target.name]: e.target.value as string });


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
    setLoading(true);
    setStatus("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) setStatus("Message sent! We'll be in touch.");
    else setStatus("Could not send. Try again or email directly.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="w-full min-h-screen bg-[#0A0E12] font-[Manrope]">
      <div className="max-w-2xl mx-auto px-4 py-10 pt-20 pt-50">
        {/* Header */}
        <h1 className="font-[clash] text-3xl md:text-5xl text-white mb-4">
          Contact Studio Perennis
        </h1>
        <p className="text-[#cfd8dc] mb-8 text-lg font-medium">
          We're happy to answer your questions about our courses, books, or community!
        </p>
        
        {/* UX Hint */}
        <p className="text-[#00ADB5] text-center my-2 text-xs font-semibold opacity-80">
          Swipe, scroll, or use arrows to explore contact modes
        </p>

        {/* Swiper animated contact cards Coverflow effect + arrows + dots */}
        <div className="mb-10">
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            navigation={true}
            pagination={{ clickable: true }}
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 120,
              modifier: 1,
              slideShadows: true,
            }}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="w-full max-w-md h-[260px]"
          >
            <SwiperSlide className="pt-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.04, boxShadow: "0 6px 24px -6px #00adb530" }}
                className="bg-[#11151A] rounded-lg p-6 flex flex-col items-center cursor-pointer shadow-lg h-full justify-center"
              >
                <FiMail className="text-[#00ADB5] w-7 h-7 mb-2" />
                <span className="font-semibold text-white">Email</span>
                <a
                  href="mailto:contact@studioperennis.com"
                  className="text-[#cfd8dc] text-sm mt-1"
                >
                  contact@studioperennis.com
                </a>
              </motion.div>
            </SwiperSlide>
            <SwiperSlide className="pt-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.04, boxShadow: "0 6px 24px -6px #00adb530" }}
                className="bg-[#11151A] rounded-lg p-6 flex flex-col items-center cursor-pointer shadow-lg h-full justify-center"
              >
                <FiPhone className="text-[#00ADB5] w-7 h-7 mb-2" />
                <span className="font-semibold text-white">Phone</span>
                <a href="tel:+1234567890" className="text-[#cfd8dc] text-sm mt-1">
                  +1 (234)-567-890
                </a>
              </motion.div>
            </SwiperSlide>
            <SwiperSlide className="pt-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.04, boxShadow: "0 6px 24px -6px #00adb530" }}
                className="bg-[#11151A] rounded-lg p-6 flex flex-col items-center cursor-pointer shadow-lg h-full justify-center"
              >
                <FiMapPin className="text-[#00ADB5] w-7 h-7 mb-2" />
                <span className="font-semibold text-white">Address</span>
                <span className="text-[#cfd8dc] text-sm mt-1 text-center">
                  123 Studio St, Perennis City
                </span>
              </motion.div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Contact Form */}
        <form
          className="bg-[#11151A] rounded-xl p-8 shadow-lg space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-[#cfd8dc] mb-2 font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-[#15181f] text-white border border-[#33394A] focus:border-[#00ADB5] outline-none transition duration-200"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-[#cfd8dc] mb-2 font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-[#15181f] text-white border border-[#33394A] focus:border-[#00ADB5] outline-none transition duration-200"
              placeholder="Your email"
            />
          </div>
          <div>
            <label className="block text-[#cfd8dc] mb-2 font-medium">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
              className="w-full px-4 py-2 rounded bg-[#15181f] text-white border border-[#33394A] focus:border-[#00ADB5] outline-none transition duration-200"
              placeholder="Your message"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 rounded font-bold text-lg bg-[#00ADB5] text-white hover:bg-[#09cfc0] transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
          {status && (
            <div className="text-center text-[#00ADB5] mt-2 font-medium animate-fade-in-up">
              {status}
            </div>
          )}
        </form>

        {/* Social Links Row */}
        <div className="flex gap-6 items-center justify-center mt-8">
          <a
            href="https://linkedin.com/company/studioperennis"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="p-3 bg-[#181d25] rounded-full hover:bg-[#00ADB5]/20 transition text-white"
          >
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a
            href="https://instagram.com/studioperennis"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-3 bg-[#181d25] rounded-full hover:bg-[#00ADB5]/20 transition text-white"
          >
            <FaInstagram className="w-6 h-6" />
          </a>
          <a
            href="https://twitter.com/studioperennis"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="p-3 bg-[#181d25] rounded-full hover:bg-[#00ADB5]/20 transition text-white"
          >
            <FaTwitter className="w-6 h-6" />
          </a>
        </div>
      </div>
    </main>
  );
}
