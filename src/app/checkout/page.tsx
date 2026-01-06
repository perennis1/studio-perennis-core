//C:\Users\studi\my-next-app\src\app\checkout\page.tsx


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface CartItem {
  id: number;
  name: string;
  variantId: number;

  quantity?: number;
  price?: number; // UI only
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, openAuthModal } = useUser() as any;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(stored);
  }, []);

  useEffect(() => {
    if (!user) openAuthModal?.();
  }, [user, openAuthModal]);

  const total = cartItems.reduce((sum, i) => {
    return sum + (i.price || 0) * (i.quantity || 1);
  }, 0);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal?.();
      return;
    }

    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
     const items = cartItems.map(i => ({
  variantId: Number(i.variantId),
  qty: Number(i.quantity ?? 1),
}));

      const res = await fetch("http://localhost:5000/api/checkout/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error("Checkout initiation failed");

      const order = await res.json();

    const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  order_id: razorpayOrder.id,

  currency: "INR",
  name: "Studio Perennis",
  description: "Book purchase",
  prefill: {
    name: contactName,
    email: contactEmail,
    contact: phone,
  },
  handler: () => {
    localStorage.removeItem("cartItems");
    window.dispatchEvent(new Event("storage"));
    router.push("/orders");
  },
  theme: { color: "#00ADB5" },
};


      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed or cancelled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-6">
        <h1 className="text-3xl font-semibold text-center">Checkout</h1>
        <p className="text-center text-gray-400 mt-4">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white pt-28 px-6">
      <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-[2fr,1.3fr]">

        {/* LEFT */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-semibold">Checkout</h1>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <input
              required
              placeholder="Full name"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              className="w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#00ADB5] rounded-lg font-semibold hover:bg-[#00ADB5]/80 disabled:opacity-60"
          >
            {isSubmitting ? "Processing…" : "Pay with Razorpay"}
          </button>
        </form>

        {/* RIGHT */}
        <aside className="bg-white/5 border border-white/10 rounded-xl p-5 h-fit">
          <h2 className="text-sm font-medium mb-4">Order summary</h2>
          <div className="space-y-3">
  {cartItems.map((item, index) => (
    <div
      key={`${item.variantId}-${index}`}
      className="flex justify-between text-sm"
    >
      <span>
        {item.name} × {item.quantity || 1}
      </span>
      <span>
        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
      </span>
    </div>
  ))}
</div>

          <div className="border-t border-white/10 mt-4 pt-3 flex justify-between">
            <span>Total</span>
            <span className="font-semibold">₹{total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
