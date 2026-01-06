//C:\Users\studi\my-next-app\src\app\auth\login\page.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const { token, user } = await loginUser({
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setSuccess("Welcome back!");

    setTimeout(() => {
      if (user.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }, 800);
  } catch (err: any) {
    setError(err.message || "Login failed.");
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
          Sign In
        </h1>
        <p className="text-center text-sm text-slate-400 mb-6">
          Welcome back to Studio Perennis
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </motion.button>
        </form>

     {success && (
  <p className="mt-4 text-center text-xs text-emerald-400">{success}</p>
)}
{error && (
  <p className="mt-2 text-center text-xs text-red-400">{error}</p>
)}


        <p className="mt-6 text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="font-semibold text-cyan-400 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
