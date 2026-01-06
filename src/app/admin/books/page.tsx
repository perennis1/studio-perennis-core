//C:\Users\studi\my-next-app\src\app\admin\books\page.tsx

"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

type VariantInput = {
  type: "PDF" | "HARDCOPY";
  sku: string;
  pricePaise: string;
};

export default function AdminBooksPage() {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("");

  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const [variants, setVariants] = useState<VariantInput[]>([
    { type: "PDF", sku: "", pricePaise: "" },
    { type: "HARDCOPY", sku: "", pricePaise: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!user?.isAdmin) {
    return <div className="pt-28 text-center text-red-400">Admin only</div>;
  }

  const updateVariant = (
    index: number,
    field: keyof VariantInput,
    value: string
  ) => {
    setVariants((v) =>
      v.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !pdf) {
      setStatus("Title and PDF required");
      return;
    }

    const validVariants = variants.filter(
      (v) => v.sku && v.pricePaise
    );

    if (!validVariants.length) {
      setStatus("At least one variant required");
      return;
    }

    setLoading(true);
    setStatus(null);

    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    form.append("description", description);
    form.append("pages", pages);
    form.append("pdf", pdf);
    if (cover) form.append("cover", cover);

    form.append(
      "variants",
      JSON.stringify(
        validVariants.map((v) => ({
          type: v.type,
          sku: v.sku,
          pricePaise: Number(v.pricePaise),
        }))
      )
    );

    const res = await fetch("http://localhost:5000/api/books", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Upload failed");
    } else {
      setStatus("Book + variants created");
      setTitle("");
      setAuthor("");
      setDescription("");
      setPages("");
      setPdf(null);
      setCover(null);
      setVariants([
        { type: "PDF", sku: "", pricePaise: "" },
        { type: "HARDCOPY", sku: "", pricePaise: "" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-28 px-6 bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10"
      >
        <h1 className="text-3xl font-bold">Admin · Add Book</h1>

        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="input"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <textarea
          className="input min-h-[120px]"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Pages"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
        />

        <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
        <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Variants</h2>

          {variants.map((v, i) => (
            <div key={v.type} className="grid grid-cols-3 gap-4">
              <span className="pt-3">{v.type}</span>

              <input
                className="input"
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
              />

              <input
                className="input"
                placeholder="Price (paise)"
                value={v.pricePaise}
                onChange={(e) =>
                  updateVariant(i, "pricePaise", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full h-14 bg-emerald-500 text-black font-bold rounded-2xl"
        >
          {loading ? "Uploading…" : "Create Book"}
        </button>

        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-slate-300"
          >
            {status}
          </motion.div>
        )}
      </form>
    </div>
  );
}
