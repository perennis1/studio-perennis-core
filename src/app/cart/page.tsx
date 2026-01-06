//C:\Users\studi\my-next-app\src\app\cart\page.tsx


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CartItem {
  variantId: string;
  name: string;
  price?: number;
  quantity?: number;
}


export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(stored);
  }, []);



const removeItem = (variantId: string) => {
  const updated = cartItems.filter(
    (item) => item.variantId !== variantId
  );


    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white pt-28 px-6">
      <h1 className="text-8xl font-semibold mb-2 mt-20 text-center">
        YOUR CART
      </h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-20">
          <p className="text-gray-400 text-2xl mb-6">Your cart is empty.</p>
          <Link
            href="/courses"
            className="px-6 py-2 bg-[#00ADB5] rounded-md hover:bg-[#00ADB5]/80 transition"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
        {cartItems.map((item, index) => (
  <div
    key={`${item.variantId}-${index}`}
    className="flex items-center justify-between bg-white/10 rounded-lg p-4 border border-white/10"
  >

              <div>
                <h2 className="text-lg font-medium">{item.name}</h2>
                <p className="text-gray-400 text-sm">
                  ₹{item.price || 0} × {item.quantity || 1}
                </p>
              </div>
              <button onClick={() => removeItem(item.variantId)}
                className="text-red-400 hover:text-red-600 transition"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-6">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full inline-flex justify-center mt-4"
          >
            <span className="w-full py-3 bg-[#00ADB5] rounded-lg text-lg font-semibold hover:bg-[#00ADB5]/80 transition text-center">
              Proceed to Checkout
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
