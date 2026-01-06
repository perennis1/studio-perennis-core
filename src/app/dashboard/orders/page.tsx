"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
// src/app/dashboard/orders/page.tsx
import { BookOrder, BookOrderItem } from "@studio-perennis/database";


interface OrderWithItems extends BookOrder {
  items: BookOrderItem[];
}
interface ExtendedOrderItem extends BookOrderItem {
  bookTitle?: string;
}


export default function MyOrdersPage() {
  const { user } = useUser() as any;
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/orders/users?userId=${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setOrders)
      .catch((err) => {
        console.error("Failed to load orders", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Only orders that include at least one hardcopy item
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.items.some((i) => i.format === "hardcopy")
      ),
    [orders]
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white pt-28 px-6">
        <div className="max-w-4xl mx-auto mt-12">
          <p className="text-center text-gray-400">
            Please sign in to view your orders.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white pt-28 px-6">
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center py-20 text-gray-400">
            Loading your orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white pt-28 px-6">
      <div className="max-w-4xl mx-auto mt-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">My Orders</h1>
            <p className="mt-1 text-sm text-gray-400">
              Track your shipped books and deliveries.
            </p>
          </div>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
            <p className="text-lg text-gray-300 mb-1">
              {orders.length === 0
                ? "No orders yet"
                : "No hardcopy orders yet"}
            </p>
            <p className="text-sm text-gray-500">
              Your hardcopy purchases will appear here after checkout.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const hasPdf = order.items.some((i) => i.format === "pdf");
              const hasHardcopy = order.items.some(
                (i) => i.format === "hardcopy"
              );
              
  
const statusColor =
  (order.status as string) === "DELIVERED"  // ✅ Cast to string first
    ? "bg-emerald-500/15 text-emerald-300"
    : (order.status as string) === "SHIPPED"
    ? "bg-sky-500/15 text-sky-300"
    : "bg-slate-500/15 text-slate-300";


              return (
                <div
                  key={order.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
                >
                  {/* subtle glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-teal-500/30 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-purple-500/25 blur-3xl" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    {/* Header row */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-gray-200">
                            #{order.id.toString().padStart(6, "0")}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}
                          >
                            {order.status}
                          </span>
                          {hasPdf && (
                            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] text-sky-300">
                              PDFs included
                            </span>
                          )}
                          {hasHardcopy && (
                            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] text-amber-300">
                              Hardcopy
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ₹{order.totalAmount}
                        </p>
                        <p className="text-xs text-gray-400">Order total</p>
                        <div className="mt-3 flex flex-wrap justify-end gap-2 text-xs">
                          <Link
                            href={`/orders/confirmation?orderId=${order.id}`}
                            className="font-semibold text-teal-300 hover:text-teal-200"
                          >
                            View details →
                          </Link>
                          {hasPdf && (
                            <Link
                              href="/dashboard/bookshelf"
                              className="font-semibold text-sky-300 hover:text-sky-200"
                            >
                              Open PDFs
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="mt-2 space-y-2">
                      {order.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-gray-100">
                              {item.bookTitle ?? `Book #${item.bookId}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.format.toUpperCase()} • Qty{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <p className="ml-3 text-sm font-semibold text-gray-100">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery snippet */}
                    {order.shippingCity && (
                      <div className="mt-2 border-t border-white/10 pt-3 text-xs text-gray-400">
                        <span className="font-medium text-gray-300">
                          Ships to:
                        </span>{" "}
                        {order.shippingAddress &&
                          `${order.shippingAddress}, `}
                        {order.shippingCity}, {order.shippingState}{" "}
                        {order.shippingZip} {order.shippingCountry}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
