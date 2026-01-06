"use client";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CartButton() {
  const router = useRouter();
  const [count, setCount] = useState<number>(0);
  const [clicked, setClicked] = useState<boolean>(false);

  // Load cart count from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCount(cart.length);

    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCount(updated.length);
    };

    // Listen to changes in localStorage
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 250); // short ripple animation
    router.push("/cart");
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className="relative p-2 rounded-full hover:bg-gray-200 transition"
    >
      {/* ripple pulse animation */}
      {clicked && (
        <span className="absolute inset-0 bg-gray-300 rounded-full animate-ping opacity-40" />
      )}

      <ShoppingCart className="w-6 h-6 text-gray-700" />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </motion.button>
  );
}
