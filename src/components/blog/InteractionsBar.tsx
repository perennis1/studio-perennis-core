// src/components/blog/InteractionsBar.tsx
"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  postId: number;
  slug: string;
  initialLikes: number;
  initialBookmarks: number;
  initialComments: number;
  initialLiked: boolean;
  initialSaved: boolean;
};

function classNames(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export default function InteractionsBar({
  postId,
  slug,
  initialLikes,
  initialBookmarks,
  initialComments,
  initialLiked,
  initialSaved,
}: Props) {
  const { user } = useUser();
  const isLoggedIn = !!user;

  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [commentsCount] = useState(initialComments);

  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);

  const [likePending, setLikePending] = useState(false);
  const [savePending, setSavePending] = useState(false);

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      alert("Please log in to like this essay.");
      return;
    }
    if (!API_BASE_URL || likePending) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    if (!token) return;

    setLikePending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to toggle like");

      const data: { likesCount: number; liked?: boolean } = await res.json();
      setLikes(data.likesCount);
      setLiked((prev) =>
        typeof data.liked === "boolean" ? data.liked : !prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLikePending(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      alert("Please log in to save this essay.");
      return;
    }
    if (!API_BASE_URL || savePending) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    if (!token) return;

    setSavePending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${postId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to toggle save");

      const data: { bookmarksCount: number; saved?: boolean } =
        await res.json();
      setBookmarks(data.bookmarksCount);
      setSaved((prev) =>
        typeof data.saved === "boolean" ? data.saved : !prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavePending(false);
    }
  };

  return (
    <div className="mt-3 flex flex_wrap items-center justify-between gap-3 text-xs text-slate-400">
      <div className="flex flex-wrap items-center gap-2">
        {/* like */}
        <button
          type="button"
          disabled={likePending || !isLoggedIn}
          onClick={handleToggleLike}
          className={classNames(
            "flex items-center gap-1 rounded-full px-3 py-1 transition-transform transition-colors duration-150 border",
            liked
              ? "bg-pink-500/15 border-pink-500/60 text-pink-200 scale-105"
              : "bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800",
            !isLoggedIn &&
              "opacity-60 cursor-not-allowed hover:bg-slate-900/80"
          )}
        >
          <span
            className={classNames(
              "text-sm",
              liked ? "text-pink-400" : "text-slate-400"
            )}
          >
            ♥
          </span>
          <span>{likes}</span>
        </button>

        {/* save */}
        <button
          type="button"
          disabled={savePending || !isLoggedIn}
          onClick={handleToggleSave}
          className={classNames(
            "flex items-center gap-1 rounded-full px-3 py-1 transition-transform transition-colors duration-150 border",
            saved
              ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-200 scale-105"
              : "bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800",
            !isLoggedIn &&
              "opacity-60 cursor-not-allowed hover:bg-slate-900/80"
          )}
        >
          <span
            className={classNames(
              "text-xs",
              saved ? "text-emerald-400" : "text-slate-400"
            )}
          >
            ⬩
          </span>
          <span>Save</span>
          <span className="text-[10px] text-slate-500">({bookmarks})</span>
        </button>

        {/* comments count */}
        <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
          <span className="text-[11px] text-slate-400">💬</span>
          <span>{commentsCount}</span>
        </div>
      </div>
    </div>
  );
}
