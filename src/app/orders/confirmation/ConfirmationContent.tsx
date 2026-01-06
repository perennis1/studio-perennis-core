// src/app/orders/confirmation/ConfirmationContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: number;
  bookId: number | null;
  bookTitle: string | null;
  format: "pdf" | "hardcopy";
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  contactName: string;
  contactEmail: string;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  deliveryNotes: string | null;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order.");
      setLoading(false);
      return;
    }

    fetch(`/api/orders/one?orderId=${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Order not found.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white pt-28 px-6">
        <p className="text-center text-gray-400 mt-24">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white pt-28 px-6">
        <p className="text-center text-gray-400 mt-24">
          {error || "Order not found."}
        </p>
      </div>
    );
  }

  const hasPdf = order.items.some((i) => i.format === "pdf");
  const hasHardcopy = order.items.some((i) => i.format === "hardcopy");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white pt-32 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-teal-600/20 via-sky-500/10 to-purple-600/20 p-[1px] shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <div className="relative z-10 rounded-2xl bg-black/70 backdrop-blur-xl px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Order confirmed
                </div>
                <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Thank you for your order
                </h1>
                <p className="mt-2 text-sm text-gray-300">
                  Order{" "}
                  <span className="font-mono text-teal-300">
                    #{order.id.toString().padStart(6, "0")}
                  </span>{" "}
                  has been placed. A confirmation email has been sent to{" "}
                  <span className="text-gray-100 font-medium">
                    {order.contactEmail}
                  </span>
                  .
                </p>
              </div>
              <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
                🎉
              </div>
            </div>

            {/* Status chips */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {hasPdf && (
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-300">
                  Instant PDF access ready
                </span>
              )}
              {hasHardcopy && (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">
                  Hardcopy will be shipped soon
                </span>
              )}
            </div>
          </div>

          {/* subtle glow */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-teal-500/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-purple-500/25 blur-3xl" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.5fr,1.2fr]">
          {/* Items card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-[0.15em]">
                Order summary
              </h2>
              <span className="text-xs text-gray-400">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="space-y-3 mt-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-black/40 px-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/30 to-sky-500/20 text-lg">
                      📘
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-100">
                        {item.bookTitle ?? `Book #${item.bookId}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.format.toUpperCase()} • Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-100">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-sm">
              <span className="text-gray-300">Order total</span>
              <span className="text-lg font-semibold text-white">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery + next steps */}
          <div className="space-y-4">
            {hasHardcopy && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-[0.14em] mb-3 flex items-center gap-2">
                  <span className="text-lg">📦</span> Delivery details
                </h3>
                <p className="text-sm text-gray-300">
                  {order.contactName}
                  <br />
                  {order.shippingAddress}
                  {order.shippingCity && <>, {order.shippingCity}</>}
                  {order.shippingState && <>, {order.shippingState}</>}
                  {order.shippingZip && <>, {order.shippingZip}</>}
                  {order.shippingCountry && <>, {order.shippingCountry}</>}
                </p>
                {order.deliveryNotes && (
                  <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-amber-200">
                    📝 {order.deliveryNotes}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-teal-500/40 bg-teal-500/10 p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-teal-200 uppercase tracking-[0.16em]">
                Next steps
              </h3>
              <p className="text-xs text-teal-100/80">
                Your order is now in your account. You can access your digital
                books instantly and track hardcopy delivery from your dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                {hasPdf && (
                  <Link
                    href="/dashboard/bookshelf"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-teal-400 text-black text-sm font-semibold hover:bg-teal-300 transition"
                  >
                    Open bookshelf
                  </Link>
                )}
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-teal-300/60 text-sm font-semibold text-teal-100 hover:bg-teal-300/10 transition"
                >
                  View all orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
