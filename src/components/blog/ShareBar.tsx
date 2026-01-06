// src/components/blog/ShareBar.tsx
"use client";

import { useCallback } from "react";
import { Share2, Copy, MessageCircle, Link2 } from "lucide-react";

type Props = {
  title: string;
  slug: string;
};

export default function ShareBar({ title, slug }: Props) {
  const getUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    // Fallback if ever rendered without window
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://studioperennis.com";
    return `${base}/blogs/${slug}`;
  };

  const handleNativeShare = useCallback(() => {
    const url = getUrl();
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any)
        .share({
          title,
          url,
        })
        .catch(() => {});
    } else {
      // Fallback: copy link
      handleCopy();
    }
  }, [title, slug]);

  const handleCopy = useCallback(() => {
    const url = getUrl();
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      // Old fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    // You can add a toast later; silent for now
  }, [slug]);

  const shareTo = (platform: "x" | "reddit" | "facebook" | "whatsapp") => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(title);

    let shareUrl = "";

    switch (platform) {
      case "x":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "reddit":
        shareUrl = `https://www.reddit.com/submit?url=${url}&title=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=600");
  };

  const baseBtn =
    "group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/80 text-slate-200 text-[11px] transition transform hover:-translate-y-0.5 hover:border-sky-400 hover:bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.6)]";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
      <span className="mr-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
        Share
      </span>

      {/* Native share / general share */}
      <button
        type="button"
        onClick={handleNativeShare}
        className={baseBtn}
        title="Share"
      >
        <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={() => shareTo("whatsapp")}
        className={baseBtn + " border-emerald-500/40 hover:border-emerald-400"}
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="pointer-events-none absolute -bottom-4 text-[9px] text-emerald-300/80">
          WA
        </span>
      </button>

      {/* X / Twitter */}
      <button
        type="button"
        onClick={() => shareTo("x")}
        className={baseBtn + " border-sky-500/50 hover:border-sky-400"}
        title="Share on X"
      >
        <span className="text-[13px] font-semibold transition-transform group-hover:scale-110">
          X
        </span>
      </button>

      {/* Reddit */}
      <button
        type="button"
        onClick={() => shareTo("reddit")}
        className={baseBtn + " border-orange-400/60 hover:border-orange-300"}
        title="Share on Reddit"
      >
        <span className="text-[12px] font-semibold transition-transform group-hover:scale-110">
          r
        </span>
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => shareTo("facebook")}
        className={baseBtn + " border-blue-500/60 hover:border-blue-400"}
        title="Share on Facebook"
      >
        <span className="text-[13px] font-semibold transition-transform group-hover:scale-110">
          f
        </span>
      </button>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        className={baseBtn}
        title="Copy link"
      >
        <Link2 className="h-4 w-4 transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
}
