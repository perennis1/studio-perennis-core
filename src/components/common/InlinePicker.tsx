// src/components/common/InlinePicker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import GifPicker, { TenorImage, Theme } from "gif-picker-react";

type Tab = "emoji" | "gifs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: (url: string) => void;
};

function classNames(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export default function InlinePicker({
  open,
  onOpenChange,
  onEmojiSelect,
  onGifSelect,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("emoji");
  const apiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY || "";

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* dim background only over comments area */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={ref}
        className="fixed z-50 inset-x-4 top-1/4 sm:inset-x-auto sm:right-8 sm:left-auto sm:top-1/4 max-w-md mx-auto rounded-2xl border border-slate-700 bg-slate-950/95 shadow-2xl overflow-hidden"
      >
        {/* tabs row */}
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900/90 border-b border-slate-700">
          <button
            className={classNames(
              "px-3 py-1.5 rounded-full text-xs font-semibold",
              activeTab === "emoji"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
            onClick={() => setActiveTab("emoji")}
          >
            Emoji
          </button>
          <button
            className={classNames(
              "px-3 py-1.5 rounded-full text-xs font-semibold",
              activeTab === "gifs"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
            onClick={() => setActiveTab("gifs")}
          >
            GIFs
          </button>
        </div>

        {/* content */}
        <div className="h-[260px] sm:h-[300px] picker-scroll overflow-y-auto bg-slate-900">
          {activeTab === "emoji" && (
            <EmojiPicker
              onEmojiClick={(d) => onEmojiSelect(d.emoji)}
              theme={Theme.DARK}
              width="100%"
              height="100%"
              searchDisabled
              previewConfig={{ showPreview: false }}
            />
          )}

          {activeTab === "gifs" && apiKey && (
            <GifPicker
              tenorApiKey={apiKey}
              onGifClick={(gif: TenorImage) => onGifSelect(gif.url)}
              theme={Theme.DARK}
              width="100%"
              height="100%"
            />
          )}

          {activeTab === "gifs" && !apiKey && (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Add NEXT_PUBLIC_TENOR_API_KEY to enable GIFs.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

