//src/components/commons/GifPickerButton.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import GifPicker, { TenorImage, Theme } from "gif-picker-react";

type Props = { onSelect: (gifUrl: string) => void };

export default function GifPickerButton({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY;

  const handleGifClick = (gif: TenorImage) => {
    onSelect(gif.url);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!apiKey) {
    return (
      <button
        type="button"
        disabled
        className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-500 cursor-not-allowed"
      >
        GIF
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs px-2 py-1 rounded-full hover:bg-slate-800"
      >
        GIF
      </button>
      {open && (
  <div className="absolute z-50 bottom-9 left-0 w-[240px] max-w-[80vw] h-[280px] rounded-xl border border-slate-700 bg-slate-900 shadow-lg overflow-hidden picker-scroll">
    <GifPicker
      tenorApiKey={apiKey}
      onGifClick={handleGifClick}
      theme={Theme.DARK}
      width={200}
      height={280}
    />
  </div>
)}

    </div>
  );
}

