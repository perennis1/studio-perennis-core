// src/components/auth/LoginModal.tsx - Updated with type safety

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OAuthButtons from "./OAuthButtons";
import { loginUser, createUserWithToken } from "@/lib/authClient";
import { useUser } from "@/context/UserContext";

export default function LoginModal({
  onClose,
  onGoogleOAuth,
  onAppleOAuth,
}: {
  onClose: () => void;
  onGoogleOAuth?: () => Promise<void>;
  onAppleOAuth?: () => Promise<void>;
}) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<null | "google" | "apple">(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);

  const { setUser } = useUser();

  function updateProgress(next = form) {
    let p = 0;
    if (next.email.length > 4 && next.email.includes("@")) p++;
    if (next.password.length > 5) p++;
    setProgress(p);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    setTimeout(() => updateProgress(next), 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { token, user } = await loginUser({
        email: form.email,
        password: form.password,
      });

      // Create UserWithToken for context using the new helper
      const userData = createUserWithToken(user, token);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      setMessage("Welcome back!");
      setTimeout(() => {
        onClose();
        if (userData.isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/courses";
        }
      }, 1000);
    } catch (err: any) {
      setMessage(err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    if (provider === "google" && onGoogleOAuth) await onGoogleOAuth();
    else if (provider === "apple" && onAppleOAuth) await onAppleOAuth();
    setLoadingProvider(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ duration: 0.35 }}
        className="relative bg-gradient-to-b from-[#161a22]/90 to-[#1b1e26]/90 border border-white/10 backdrop-blur-2xl text-white rounded-3xl p-8 w-[92vw] max-w-md shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-2xl hover:text-[#00ADB5] transition"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold text-center mb-1">Sign In</h2>
        <p className="text-center text-base text-gray-400 mb-5">Welcome back to Studio Perennis</p>

        <OAuthButtons
          onGoogle={() => handleOAuth("google")}
          onApple={() => handleOAuth("apple")}
          loadingProvider={loadingProvider}
        />

        <div className="w-full h-2 rounded bg-white/10 overflow-hidden mb-3">
          <motion.div
            className="h-2 rounded bg-[#00ADB5]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 50}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              value={form.email}
              className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-base placeholder-gray-400 focus:border-[#00ADB5] outline-none transition peer"
              autoFocus
            />
            <label
              className={`absolute left-4 top-2.5 px-1 text-gray-300 text-xs transition-all pointer-events-none
                ${
                  form.email
                    ? "-translate-y-5 scale-90 text-[#00ADB5]"
                    : "peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-[#00ADB5]"
                }`}
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              required
              value={form.password}
              className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-base placeholder-gray-400 focus:border-[#00ADB5] outline-none transition peer"
            />
            <label
              className={`absolute left-4 top-2.5 px-1 text-gray-300 text-xs transition-all pointer-events-none
                ${
                  form.password
                    ? "-translate-y-5 scale-90 text-[#00ADB5]"
                    : "peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-[#00ADB5]"
                }`}
            >
              Password
            </label>
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-2 text-[#00ADB5] text-lg transition hover:scale-105"
              tabIndex={0}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ADB5] text-white font-semibold py-3 rounded-xl hover:bg-[#00ADB5]/80 transition disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-white border-[#00ADB5] rounded-full"></span>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute left-0 right-0 mx-auto mt-2 text-center py-2 px-5 rounded-xl 
                ${
                  message === "Welcome back!" ? "bg-[#00ADB5] text-white" : "bg-red-600/90 text-white"
                }
                z-20`}
              style={{ top: "100%", maxWidth: "90%" }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-base text-gray-400 mt-8">
          Don't have an account?{" "}
          <span
            onClick={onClose}
            className="text-[#00ADB5] cursor-pointer hover:underline font-semibold"
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );
}