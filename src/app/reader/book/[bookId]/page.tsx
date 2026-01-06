//C:\Users\studi\my-next-app\src\app\reader\book\[bookId]\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BookReader from "@/components/BookReader";
import BookPaywall from "@/components/BookPaywall";

export default function BookReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/library?bookId=${bookId}`, {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
    })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Failed to load book"))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) return null;
  if (error) return <div>{error}</div>;

  /* ======================================================
   * ACCESS DECISION (Step 13)
   * ====================================================== */
  if (data.locked) {
    // 1️⃣ OWNERSHIP PAYWALL
    if (data.reason === "PAYWALL") {
      return <BookPaywall book={data.book} />;
    }

    // 2️⃣ TIME WINDOW BLOCK
    if (data.reason === "OUTSIDE_READING_WINDOW") {
      return (
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Reading is not open at this time.
        </div>
      );
    }

    // 3️⃣ CURRICULUM SEQUENCE BLOCK
    if (data.reason === "CURRICULUM_LOCKED") {
      return (
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          This step is locked by the curriculum.
        </div>
      );
    }

    // 4️⃣ REFLECTION GATE
    if (data.gate) {
      return (
        <BookReader
          pdfEndpoint={data.book.pdfEndpoint}
          initialProgress={data.progress}
          gate={data.gate}
        />
      );
    }

    // Fallback — should never happen
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Reading is currently unavailable.
      </div>
    );
  }

  /* ======================================================
   * READER MOUNTS ONLY HERE
   * ====================================================== */
  return (
    <BookReader
      pdfEndpoint={data.book.pdfEndpoint}
      initialProgress={data.progress}
    />
  );
}
