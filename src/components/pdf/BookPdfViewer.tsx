"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Worker setup for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = {
  bookId: number;
  pdfUrl: string;
};

export function BookPdfViewer({ bookId, pdfUrl }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Tracking: send page/time info
  useEffect(() => {
    let start = Date.now();
    return () => {
      const durationMs = Date.now() - start;
      void fetch("/api/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          page: pageNumber,
          durationMs,
        }),
      });
    };
  }, [bookId, pageNumber]);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goNext = () =>
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 text-xs text-gray-300">
        <button
          onClick={goPrev}
          disabled={pageNumber === 1}
          className="px-2 py-1 rounded bg-white/10 disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          Page {pageNumber} {numPages ? `of ${numPages}` : ""}
        </span>
        <button
          onClick={goNext}
          disabled={!numPages || pageNumber === numPages}
          className="px-2 py-1 rounded bg-white/10 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="flex-1 overflow-auto border border-white/10 rounded-lg bg-black flex justify-center">
        <Document file={pdfUrl} onLoadSuccess={onLoadSuccess}>
          <Page
            pageNumber={pageNumber}
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
}
