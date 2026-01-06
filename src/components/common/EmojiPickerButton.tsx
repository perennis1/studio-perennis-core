//src/components/commons/EmojiPickerButton.tsx

"use client";

import { Theme } from "emoji-picker-react"; 
import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

type Props = { onSelect: (emoji: string) => void };

export default function EmojiPickerButton({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-base px-2 py-1 rounded-full hover:bg-slate-800"
      >
        😊
      </button>
      {open && (
  <div className="absolute z-50 bottom-9 left-0 w-[220px] max-w-[75vw] h-[260px] rounded-xl border border-slate-700 bg-slate-900 shadow-lg overflow-hidden picker-scroll">
    <EmojiPicker
      onEmojiClick={handleEmojiClick}
      theme={Theme.DARK}
      width="100%"
      height={240}
      searchDisabled
      previewConfig={{ showPreview: false }}
    />
  </div>
)}

    </div>
  );
}
