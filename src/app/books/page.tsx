"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Variant = {
  id: string;
  type: "PDF" | "HARDCOPY";
  pricePaise: number;
  owned?: boolean;
  inStock?: boolean;
};

type Book = {
  id: number;
  title: string;
  slug: string;
  author: string | null;
  description: string | null;
  pages: number | null;
  coverImage: string | null;
  variants: Variant[];
};

/* -------------------------------------------------------------------------- */
/*                              RAZORPAY LOADER                               */
/* -------------------------------------------------------------------------- */

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function BooksPage() {
  const { user, openAuthModal } = useUser() as any;
  const [books, setBooks] = useState<Book[]>([]);

  /* ------------------------------ FETCH BOOKS ------------------------------ */

  useEffect(() => {
    fetch("http://localhost:5000/api/books/storefront", {
      headers: user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {},
    })
      .then((r) => r.json())
      .then((d) => setBooks(d.books || []))
      .catch(() => setBooks([]));
  }, [user]);

  /* ------------------------------ BUY PDF FLOW ----------------------------- */

  async function buyPdf(bookId: number) {
    if (!user) {
      openAuthModal?.();
      return;
    }

    const ok = await loadRazorpay();
    if (!ok) {
      alert("Razorpay failed to load");
      return;
    }

    const res = await fetch(`/api/books/${bookId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Checkout failed");
      return;
    }

    const { razorpayOrderId, amount, currency } = await res.json();

    const rzp = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency,
      order_id: razorpayOrderId,
      name: "Studio Perennis",
      description: "Book PDF Purchase",
      handler: () => {
        // DO NOTHING optimistic
        // webhook unlocks access
        window.location.href = "/dashboard/bookshelf";
      },
    });

    rzp.open();
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#060918] to-black text-white pt-24 pb-16">
      <section className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Book Store
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <motion.article
              key={book.id}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col"
            >
              <div className="relative h-64 bg-black/30">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    📚
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1">
                <div>
                  <h2 className="text-xl font-bold">{book.title}</h2>
                  {book.author && (
                    <p className="text-sm text-slate-400">
                      by {book.author}
                    </p>
                  )}
                </div>

                {book.description && (
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {book.description}
                  </p>
                )}

                <div className="space-y-2 mt-auto">
                  {book.variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-slate-400">{v.type}</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(v.pricePaise / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-2 pt-3">
                    {book.variants.map((v) => {
                      /* -------- READ OWNED PDF -------- */
                      if (v.type === "PDF" && v.owned) {
                        return (
                          <Link
                            key={v.id}
                            href={`/reader/book/${book.id}`}
                            className="rounded-xl bg-white/10 py-3 text-xs text-center"
                          >
                            Read
                          </Link>
                        );
                      }

                      /* -------- HARDCOPY OUT OF STOCK -------- */
                      if (v.type === "HARDCOPY" && v.inStock === false) {
                        return (
                          <button
                            key={v.id}
                            disabled
                            className="rounded-xl bg-white/5 py-3 text-xs text-slate-500"
                          >
                            Out of stock
                          </button>
                        );
                      }

                      /* -------- BUY PDF (DIRECT) -------- */
                      if (v.type === "PDF") {
                        return (
                          <button
                            key={v.id}
                            onClick={() => buyPdf(book.id)}
                            className="rounded-xl py-3 text-xs font-semibold bg-emerald-500 text-black"
                          >
                            Buy PDF
                          </button>
                        );
                      }

                      /* -------- HARDCOPY (UNCHANGED) -------- */
                      return (
                        <button
                          key={v.id}
                          className="rounded-xl py-3 text-xs font-semibold bg-sky-500 text-black"
                        >
                          Buy Hardcopy
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
