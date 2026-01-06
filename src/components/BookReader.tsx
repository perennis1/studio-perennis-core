


//C:\Users\studi\my-next-app\src\components\BookReader.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import AccessBlockPanel from "@/components/reader/AccessBlockPanel";

type BookReaderProps = {
  pdfEndpoint: string;
  bookId: string;
  initialProgress?: number; // 0 → 1
};

type AccessResult = {
  allowed: boolean;
  reason?: string;
  gate?: {
    id: string;
    pageNumber: number;
    question: string;
    minLength: number;
  };
};

export default function BookReader({
  pdfEndpoint,
  bookId,
  initialProgress = 0,
}: BookReaderProps) {
  const [PDFComponents, setPDFComponents] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [progress, setProgress] = useState(initialProgress);

  const [access, setAccess] = useState<AccessResult | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  /* -------------------------------------------------- */
  /* Load react-pdf dynamically                          */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("react-pdf")
      .then((pdf) => {
        pdf.pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        setPDFComponents(pdf);
      })
      .catch(() => {
        setPDFComponents(null);
      });
  }, []);

  /* -------------------------------------------------- */
  /* Restore page from saved progress                    */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (numPages > 0 && initialProgress > 0) {
      const restoredPage = Math.max(
        1,
        Math.ceil(initialProgress * numPages)
      );
      setPageNumber(restoredPage);
    }
  }, [numPages, initialProgress]);

  /* -------------------------------------------------- */
  /* Authoritative access check                          */
  /* -------------------------------------------------- */
  const fetchAccess = async (targetPage: number) => {
    setCheckingAccess(true);
    try {
      const res = await fetch(
        `/api/reader/access?bookId=${bookId}&page=${targetPage}`
      );
      const data: AccessResult = await res.json();
      setAccess(data);
      return data;
    } catch {
      const closed: AccessResult = { allowed: false };
      setAccess(closed);
      return closed;
    } finally {
      setCheckingAccess(false);
    }
  };

  /* -------------------------------------------------- */
  /* Initial access check                                */
  /* -------------------------------------------------- */
  useEffect(() => {
    fetchAccess(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  /* -------------------------------------------------- */
  /* Save reading progress                               */
  /* -------------------------------------------------- */
  const saveProgress = useCallback(
    async (newPage: number, totalPages: number) => {
      const newProgress = newPage / totalPages;
      setProgress(newProgress);

      try {
        await fetch("/api/reading-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            pageNumber: newPage,
            totalPages,
            progress: newProgress,
          }),
        });
      } catch {
        // silent failure — progress is best-effort
      }
    },
    [bookId]
  );

  /* -------------------------------------------------- */
  /* Page navigation (HARD ENFORCEMENT)                  */
  /* -------------------------------------------------- */
  const changePage = async (direction: "prev" | "next") => {
    if (!numPages) return;

    let nextPage = pageNumber;

    if (direction === "prev" && pageNumber > 1) nextPage--;
    if (direction === "next" && pageNumber < numPages) nextPage++;

    if (nextPage === pageNumber) return;

    const accessResult = await fetchAccess(nextPage);

    if (!accessResult.allowed) {
      return; // HARD STOP
    }

    setPageNumber(nextPage);
    saveProgress(nextPage, numPages);
  };

  /* -------------------------------------------------- */
  /* Early returns                                      */
  /* -------------------------------------------------- */
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        Checking reading access…
      </div>
    );
  }

  if (access && !access.allowed) {
    return <AccessBlockPanel access={access} />;
  }

  if (!PDFComponents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        Loading PDF viewer…
      </div>
    );
  }

  const { Document, Page } = PDFComponents;

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white pt-24 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Book Reader</h1>
          <div className="text-sm text-gray-400">
            Page {pageNumber} of {numPages || "—"}
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center max-w-2xl mx-auto">
          <button
            onClick={() => changePage("prev")}
            disabled={pageNumber <= 1}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex-1">
            <div className="w-full h-3 rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => changePage("next")}
            disabled={pageNumber >= numPages}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <div className="flex justify-center">
          <Document
            file={pdfEndpoint}
            onLoadSuccess={({ numPages }: { numPages: number }) =>
              setNumPages(numPages)
            }
            loading={null}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(900, window.innerWidth - 48)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
