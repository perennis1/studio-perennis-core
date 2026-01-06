"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";

// Team data
const team = [
  {
    name: "Mashooq",
    role: "Founder & Creative Director",
    image: "/avatars/mashooq.jpg",
    bio: "Vision-driven creator powering Studio Perennis with design, tech, and education."
  },
  {
    name: "Ayesha",
    role: "Lead Educator",
    image: "/avatars/ayesha.jpg",
    bio: "Develops impactful curricula, guiding students from concept to mastery."
  },
  {
    name: "Rohan",
    role: "Tech Lead",
    image: "/avatars/rohan.jpg",
    bio: "Architects seamless learning platforms and keeps our tools cutting-edge."
  }
];

// Values based on the manifesto
const values = [
  { icon: "🔬", label: "Inquiry" },
  { icon: "👁️", label: "Perception" },
  { icon: "🌱", label: "Growth" },
  { icon: "🧘‍♂️", label: "Consciousness" },
  { icon: "🕊️", label: "Understanding" }
];

// Timeline events
const timeline = [
  {
    year: "2018",
    title: "Founded",
    body: "Studio Perennis emerges—a response to education that nurtures presence, not just performance."
  },
  {
    year: "2020",
    title: "Our Community Grows",
    body: "Artists, thinkers, and learners join, shaping an environment alive with inquiry and creativity."
  },
  {
    year: "2022",
    title: "Courses & Programs",
    body: "We launch our first perennial learning tracks, designed to ask 'why', not just 'how'."
  },
  {
    year: "2025",
    title: "A Quiet Revolution",
    body: "Studio Perennis continues as a space for reflection, connection, and transformative change."
  }
];

// Animated quote blocks
const quotes = [
  {
    text: "Understanding is not a race, but a quiet revolution.",
    source: "Studio Perennis Manifesto"
  },
  {
    text: "Our work is perennial because truth does not expire.",
    source: "Studio Perennis Manifesto"
  },
  {
    text: "Beyond success, beyond reform — there lies consciousness.",
    source: "Studio Perennis Manifesto"
  }
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0
  }
};

const wordStagger: Variants = {
  hidden: {},
  visible: {}
};

const letterAnim: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen bg-[#0A0E12] font-[Manrope]">
      <div className="max-w-3xl mx-auto px-5 pt-40 pb-24 space-y-24">

        {/* Hero Banner with Blended Image */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative overflow-hidden text-center min-h-[300px] flex flex-col justify-center items-center"
        >
          {/* Background Image with Animate */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full z-0"
            style={{
              background: "linear-gradient(135deg,#0A0E12 70%,#00ADB5 100%)"
            }}
          >
            <Image
              src="/pathlessland.png"
              alt="Studio Perennis Manifesto"
              fill
              priority
              className="object-cover w-full h-full"
              style={{
                opacity: 0.5,
                mixBlendMode: "normal",
                filter: "blur(0.2px)"
              }}
            />
          </motion.div>
          <div className="relative z-10 py-12 px-3">
            <motion.h1
              variants={wordStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-[clash] text-4xl md:text-6xl font-semibold text-white mb-7 tracking-tight leading-tight"
            >
              {"Studio Perennis — The Manifesto".split(" ").map((word, idx) => (
                <motion.span key={word + idx} className="inline-block mr-2" variants={letterAnim}>
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              
              className="max-w-2xl mx-auto text-[#cfd8dc] text-lg md:text-xl leading-relaxed mb-4 opacity-90"
            >
              The world has never lacked teachers, only understanding.<br />
              It has never lacked initiatives, only inquiry.<br />
              Everywhere there are trainings that teach youth what to do—none that ask why.
            </motion.p>
          </div>
        </motion.section>

        {/* Manifesto Mindset */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="space-y-6"
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-3xl md:text-4xl text-white mb-3 text-center"
          >
            Beyond Performance, Toward Understanding
          </motion.h2>
          <motion.p
            variants={fadeUp}
            
            className="text-[#cfd8dc] text-lg md:text-xl leading-relaxed text-center"
          >
            Today's education builds performance, not perception.<br />
            It celebrates confidence without clarity, activism without awareness.<br />
            It fills the mind with noise and calls it progress.
          </motion.p>
          <motion.p
            variants={fadeUp}
            
            className="text-[#cfd8dc] text-lg md:text-xl leading-relaxed text-center"
          >
            But a mind that never pauses, never listens, never questions—<br />
            is merely repeating what it has been taught to admire.<br />
            Such minds fill conferences, competitions, committees—<br />
            and yet the world remains the same.
          </motion.p>
        </motion.section>

        {/* VALUES Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          viewport={{ once: true }}
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-3xl md:text-4xl text-white mb-8 text-center"
          >
            Our Values
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 justify-items-center">
            {values.map((val, i) => (
              <motion.div
                key={val.label}
                variants={fadeUp}
                custom={i}
                whileHover={{
                  scale: 1.12,
                  rotate: [0, 6, -5, 0],
                  backgroundColor: "#00adb533"
                }}
                className="bg-[#181d25] py-7 px-5 rounded-xl flex flex-col items-center shadow-md cursor-pointer select-none transition"
              >
                <span className="text-4xl mb-2">{val.icon}</span>
                <span className="text-[#00ADB5] font-bold">{val.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Difference Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="space-y-6"
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-3xl md:text-4xl text-white mb-3 text-center"
          >
            What Makes Us Unique?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            
            className="text-[#cfd8dc] text-lg md:text-xl leading-relaxed text-center"
          >
            Studio Perennis stands apart.<br />
            It does not train the mind to compete; it invites the mind to see.<br />
            Learning begins only when imitation ends; understanding is not a race, but a quiet revolution.<br />
            We awaken observers, studying both the outer world of systems and the inner world of thought.
          </motion.p>
        </motion.section>

        {/* TIMELINE Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          viewport={{ once: true }}
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-3xl md:text-4xl text-white mb-7 text-center"
          >
            Our Timeline
          </motion.h2>
          <div className="space-y-8 mt-6">
            {timeline.map((event, i) => (
              <motion.div
                key={event.year}
                variants={fadeUp}
                custom={i}
                className="relative p-6 bg-[#181d25] rounded-xl shadow flex flex-col sm:flex-row items-center gap-4"
              >
                <div className="flex-shrink-0 text-[#00ADB5] font-bold text-2xl mb-2 sm:mb-0 sm:mr-6 w-20 text-center">{event.year}</div>
                <div>
                  <div className="text-white font-[clash] text-lg mb-1">{event.title}</div>
                  <div className="text-[#cfd8dc] text-base">{event.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* QUOTES Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          viewport={{ once: true }}
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-3xl md:text-4xl text-white mb-8 text-center"
          >
            Words We Live By
          </motion.h2>
          <div className="flex flex-col items-center gap-8">
            {quotes.map((q, i) => (
              <motion.blockquote
                key={q.text}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.04, backgroundColor: "#00adb520" }}
                className="italic p-6 rounded-xl bg-[#181d25] shadow text-white text-lg max-w-xl transition"
              >
                “{q.text}”
                <span className="block text-right text-[#00ADB5] text-sm mt-2">– {q.source}</span>
              </motion.blockquote>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          viewport={{ once: true }}
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-3xl md:text-4xl text-white mb-8 text-center"
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.07, boxShadow: "0 8px 24px #00adb560" }}
                className="bg-[#181d25] p-6 rounded-xl shadow-xl flex flex-col items-center max-w-xs transition"
              >
                <Image
                  src={member.image}
                  width={80}
                  height={80}
                  alt={member.name}
                  className="rounded-full mb-3 border-2 border-[#00ADB5]"
                />
                <div className="font-[clash] text-white text-lg">{member.name}</div>
                <div className="text-[#00ADB5] text-sm mb-2">{member.role}</div>
                <div className="text-[#cfd8dc] text-sm text-center">{member.bio}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Perennial Spirit */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="space-y-6"
        >
          <motion.h2
            variants={fadeUp}
            
            className="font-[clash] text-center text-3xl md:text-4xl text-white mb-6"
          >
            The Perennial Spirit
          </motion.h2>
          <motion.p
            variants={fadeUp}
            
            className="text-[#00ADB5] text-lg md:text-xl font-semibold text-center"
          >
            Our work is perennial because truth does not expire.<br />
            Our studio is perennial because inquiry does not end.
          </motion.p>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center"
        >
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.07, backgroundColor: "#00ADB5", color: "#fff" }}
            className="inline-block mt-7 px-8 py-3 text-lg rounded-full bg-[#181d25] text-[#00ADB5] font-bold shadow-xl cursor-pointer transition"
          >
            Start Your Journey
          </motion.a>
        </motion.section>
      </div>
    </main>
  );
}





