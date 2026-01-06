"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/authClient";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordScore =
    (form.password.length >= 6 ? 1 : 0) +
    (/[A-Z]/.test(form.password) ? 1 : 0) +
    (/[0-9]/.test(form.password) ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setMessage("Account created. Redirecting to sign in…");
      setTimeout(() => router.push("/auth/login"), 1000);
    } catch (err: any) {
      setMessage(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden bg-slate-950">
      <Image
        src="/myfooter.jpg"
        alt="Studio Perennis background"
        fill
        className="absolute inset-0 object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-md rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl px-8 py-10 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Studio Perennis" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-semibold text-center text-slate-50 mb-2">
          Create Account
        </h1>
        <p className="text-center text-sm text-slate-400 mb-6">
          Join Studio Perennis to begin your journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="At least 6 characters"
            />
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  passwordScore === 0
                    ? "w-0"
                    : passwordScore === 1
                    ? "w-1/3 bg-red-500"
                    : passwordScore === 2
                    ? "w-2/3 bg-yellow-400"
                    : "w-full bg-emerald-400"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Repeat password"
            />
            {form.confirmPassword && (
              <p
                className={`mt-1 text-xs ${
                  form.password === form.confirmPassword
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {form.password === form.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </motion.button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-cyan-300">{message}</p>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="font-semibold text-cyan-400 hover:underline"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
