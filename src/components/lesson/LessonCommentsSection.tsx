// C:\Users\studi\my-next-app\src\components\lesson\LessonCommentsSection.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import InlinePicker from "@/components/common/InlinePicker";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type SortMode = "top" | "latest";

type UserMini = {
  id: number;
  name?: string | null;
  avatar?: string | null;
};

type Props = {
  lessonId: number;
  
  authorId: number;

};
export type CommentApi = {
  id: number;
  userId: number;
 
  content: string;
  createdAt: string;
  parentId?: number | null;
  likeCount: number;
  likedByMe?: boolean;
  pinned: boolean;
  user: UserMini;
  gifUrl?: string | null;
};

type CommentNode = CommentApi & {
  replies: CommentNode[];
};

function formatDateTime(value: string) {
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildCommentTree(comments: CommentApi[], sort: SortMode): CommentNode[] {
  const map = new Map<number, CommentNode>();
  comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  const roots: CommentNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  function sortReplies(nodes: CommentNode[]) {
    nodes.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    nodes.forEach((n) => sortReplies(n.replies));
  }

  sortReplies(roots);

  const sortedRoots = [...roots].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === "top") {
      if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return sortedRoots;
}

function classNames(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// ---------- Comment text with "Read more" ----------
function CommentBody({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 260;
  const needsClamp = content.length > limit;
  const visible = !needsClamp || expanded ? content : content.slice(0, limit) + "…";

  return (
    <div className="text-sm text-slate-100 whitespace-pre-wrap">
      {visible}
      {needsClamp && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="ml-1 text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2"
        >
          Read more
        </button>
      )}
    </div>
  );
}

// ---------- Single comment item (recursive) ----------
type CommentItemProps = {
  node: CommentNode;
  depth: number;
  isLiked: boolean;
  currentUserId: number | null;
  onReply: (c: CommentNode) => void;
  onEdit: (c: CommentNode) => void;
  onDelete: (c: CommentNode) => void;
  onToggleLike: (c: CommentNode) => void;
  isAuthorOwner: boolean;
  onTogglePin: (c: CommentNode) => void;
  authorId: number;
};

function CommentItem({
  node,
  depth,
  isLiked,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  isAuthorOwner,
  onTogglePin,
  authorId,
}: CommentItemProps) {
  const isOwner = currentUserId != null && node.userId === currentUserId;
  const isAuthor = node.userId === authorId;
  
  const displayName = node.user?.name || `User ${node.user?.id ?? node.userId}`;
  const initials =
    displayName && displayName.trim().length > 0
      ? displayName
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";

  const [showAllReplies, setShowAllReplies] = useState(false);
  const MAX_COLLAPSED_REPLIES = 2;

  const totalReplies = node.replies.length;
  const repliesToShow =
    !showAllReplies && depth === 0 && totalReplies > MAX_COLLAPSED_REPLIES
      ? node.replies.slice(0, MAX_COLLAPSED_REPLIES)
      : node.replies;
  const hiddenCount =
    !showAllReplies && depth === 0 && totalReplies > MAX_COLLAPSED_REPLIES
      ? totalReplies - MAX_COLLAPSED_REPLIES
      : 0;

  return (
    <div id={`comment-${node.id}`} className="flex">
      {depth > 0 && (
        <div className="mr-2 flex">
          <div className="w-px bg-slate-700 ml-4" />
        </div>
      )}

      <div className="flex-1">
        <div className="flex gap-2 sm:gap-3 py-3">
          <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-800 flex items-center justify-center text-[11px] sm:text-xs font-semibold text-slate-200">
            {node.user?.avatar ? (
              <img
                src={node.user.avatar}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 group">
            <div className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs text-slate-400">
              <span className="font-medium text-slate-100">{displayName}</span>

              {isAuthor && (
                <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.18em] text-emerald-200">
                  Author
                </span>
              )}

              <span className="text-slate-500">·</span>
              <span>{formatDateTime(node.createdAt)}</span>
              {node.pinned && (
                <span className="ml-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.18em] text-amber-200">
                  Pinned
                </span>
              )}
            </div>

            <CommentBody content={node.content} />

            {node.gifUrl && (
              <div className="mt-2">
                <img
                  src={node.gifUrl}
                  alt="Attached gif"
                  className="max-w-[100px] sm:max-w-[220px] max-h-[180px] object-cover rounded-lg border border-slate-700"
                />
              </div>
            )}

            <div
              className={classNames(
                "mt-1 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs",
                "text-slate-400"
              )}
            >
              <button
                type="button"
                onClick={() => onToggleLike(node)}
                className={classNames(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 transition-transform transition-colors duration-150",
                  isLiked
                    ? "bg-pink-500/20 text-pink-300 scale-105"
                    : "hover:bg-slate-800/70 text-slate-300"
                )}
              >
                <span
                  className={classNames(
                    "text-[11px]",
                    isLiked ? "text-pink-400" : "text-slate-400"
                  )}
                >
                  ♥
                </span>
                <span>{node.likeCount}</span>
              </button>

              <button
                type="button"
                onClick={() => onReply(node)}
                className="rounded-full px-2 py-0.5 hover:bg-slate-800/70"
              >
                Reply
              </button>

              <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(node)}
                      className="rounded-full px-2 py-0.5 hover:bg-slate-800/70"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(node)}
                      className="rounded-full px-2 py-0.5 text-red-300 hover:bg-red-900/30"
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const targetId = `comment-${node.id}`;
                        const url = `${window.location.origin}${window.location.pathname}#${targetId}`;

                        try {
                          await navigator.clipboard.writeText(url);
                        } catch {
                          window.location.hash = targetId;
                        }

                        const el = document.getElementById(targetId);
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }

                        alert("Comment link copied");
                      }}
                      className="rounded-full px-2 py-0.5 hover:bg-slate-800/70 text-slate-400"
                    >
                      Link
                    </button>
                  </>
                )}

                {isAuthorOwner && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(node)}
                    className="rounded-full px-2 py-0.5 hover:bg-slate-800/70 text-sky-300"
                  >
                    {node.pinned ? "Unpin" : "Pin"}
                  </button>
                )}
              </div>
            </div>


            {repliesToShow.length > 0 && (
              <div className="ml-6 space-y-0">
                {repliesToShow.map((child: any) => (
                  <CommentItem
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    isLiked={!!child.likedByMeLocal}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleLike={onToggleLike}
                    isAuthorOwner={isAuthorOwner}
                    onTogglePin={onTogglePin}
                    authorId={authorId}
                    
                  />
                ))}

                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReplies(true)}
                    className="mt-1 text-[11px] text-sky-300 hover:text-sky-200"
                  >
                    View {hiddenCount} more repl
                    {hiddenCount === 1 ? "y" : "ies"}
                  </button>
                )}

                {showAllReplies &&
                  depth === 0 &&
                  totalReplies > MAX_COLLAPSED_REPLIES && (
                    <button
                      type="button"
                      onClick={() => setShowAllReplies(false)}
                      className="mt-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Hide replies
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- main component ----------


export default function  LessonCommentsSection({ lessonId, authorId }: Props) {
  const { user } = useUser();

  const currentUserId = user?.id ? Number(user.id) : null;
  const isAuthorOwner = currentUserId != null && currentUserId === authorId;
  const isAdmin = !!user?.isAdmin;
  const canPin = isAuthorOwner || isAdmin;

  const currentUserName = user?.name || "Guest";
  const currentUserAvatar = user?.avatar || null;
  const isLoggedIn = !!user;
  const [comments, setComments] = useState<CommentApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [error, setError] = useState<string | null>(null);

  const [body, setBody] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentNode | null>(null);
  const [editing, setEditing] = useState<CommentNode | null>(null);

  const [likedByMe, setLikedByMe] = useState<Record<number, boolean>>({});
  const [pickerOpen, setPickerOpen] = useState(false);



useEffect(() => {
  if (!API_BASE_URL) return;

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(
        `${API_BASE_URL}/courses/lessons/${lessonId}/comments?sort=${sortMode}`,
        {
          cache: "no-store",
          headers,
        }
      );
      if (!res.ok) throw new Error("Failed to load comments");
      const data: CommentApi[] = await res.json();
      setComments(data);

      const likedMap: Record<number, boolean> = {};
      data.forEach((c) => {
        if (c.likedByMe) likedMap[c.id] = true;
      });
      setLikedByMe(likedMap);
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  run();
}, [lessonId, sortMode]);


  const tree = useMemo(() => {
    const baseTree = buildCommentTree(comments, sortMode);

    const attachLiked = (nodes: CommentNode[]): CommentNode[] =>
      nodes.map((n) => {
        const likedLocal = likedByMe[n.id] ?? false;
        const withFlag = { ...n, likedByMeLocal: likedLocal } as any as CommentNode;
        return {
          ...(withFlag as any),
          replies: attachLiked(n.replies),
        };
      });

    return attachLiked(baseTree);
  }, [comments, sortMode, likedByMe]);

  const totalCount = comments.length;

  const resetComposer = () => {
    setBody("");
    setGifUrl(null);
    setReplyTo(null);
    setEditing(null);
    setPickerOpen(false);
  };

  const handleSubmit = async () => {
  if (!API_BASE_URL) return;
  const trimmed = body.trim();
  if (!trimmed && !gifUrl) return;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  if (!token) {
    setError("You must be logged in to comment.");
    return;
  }

  setSubmitting(true);
  setError(null);
  try {
    if (editing) {
      // UPDATE existing comment
      const res = await fetch(
        `${API_BASE_URL}/courses/lessons/${lessonId}/comments/${editing.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: trimmed, gifUrl }),
        }
      );
      if (!res.ok) throw new Error("Failed to update comment");
      const updated: CommentApi = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } else {
      // CREATE new comment
      const res = await fetch(
        `${API_BASE_URL}/courses/lessons/${lessonId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: trimmed,
            parentId: replyTo ? replyTo.id : null,
            gifUrl,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to post comment");
      const created: CommentApi = await res.json();
      setComments((prev) => [...prev, created]);
    }
    resetComposer();
  } catch (err: any) {
    setError(err.message || "Failed to submit comment");
  } finally {
    setSubmitting(false);
  }
};


  const handleTogglePin = async (c: CommentNode) => {
    if (!API_BASE_URL) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) return;

    try {
      const method = c.pinned ? "DELETE" : "POST";
      const res = await fetch(
       `${API_BASE_URL}/courses/lessons/${lessonId}/comments/${c.id}/pin`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to toggle pin");

      await res.json().catch(() => null);

      setComments((prev) =>
        prev.map((cm) =>
          cm.id === c.id ? { ...cm, pinned: !cm.pinned } : cm
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = (c: CommentNode) => {
    setReplyTo(c);
    setEditing(null);
    const displayName = c.user?.name || `User ${c.user?.id ?? c.userId}`;
    if (!body.startsWith("@")) {
      setBody(`@${displayName} `);
    }
  };

  const handleEdit = (c: CommentNode) => {
    setEditing(c);
    setReplyTo(null);
    setBody(c.content);
    setGifUrl(c.gifUrl ?? null);
  };

  const handleDelete = async (c: CommentNode) => {
    if (!API_BASE_URL) return;
    const yes = window.confirm("Delete this comment?");
    if (!yes) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) {
      setError("You must be logged in to delete comments.");
      return;
    }

    try {
      const res = await fetch(
      `${API_BASE_URL}/courses/lessons/${lessonId}/comments/${c.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok && res.status !== 204)
        throw new Error("Failed to delete comment");

      setComments((prev) => prev.filter((cm) => cm.id !== c.id));
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
    }
  };

 const handleToggleLike = async (c: CommentNode) => {
  if (!API_BASE_URL) return;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  if (!token) {
    setError("You must be logged in to like comments.");
    return;
  }

  // optimistic toggle
  setLikedByMe((prev) => ({
    ...prev,
    [c.id]: !prev[c.id],
  }));

  try {
    const res = await fetch(
    `${API_BASE_URL}/courses/lessons/${lessonId}/comments/${c.id}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error("Failed to like comment");

    const data: { id: number; likeCount: number; liked?: boolean } =
      await res.json();

    console.log("LIKE RESPONSE", data);

    setComments((prev) =>
      prev.map((cm) =>
        cm.id === data.id ? { ...cm, likeCount: data.likeCount } : cm
      )
    );

    setLikedByMe((prev) => ({
      ...prev,
      [data.id]: data.liked ?? !!prev[data.id],
    }));
  } catch (err) {
    console.error("LIKE ERROR", err);
    setLikedByMe((prev) => ({
      ...prev,
      [c.id]: !prev[c.id],
    }));
  }
};


  const currentUserInitials =
    currentUserName && currentUserName.trim().length > 0
      ? currentUserName
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";
  return (
    <section className="mt-10 rounded-[32px] border border-slate-700 bg-slate-950/90 px-4 py-4 sm:px-6 max-w-2xl mx-auto">
    
      
        {/* header */}
<div className="mb-4 flex items-start justify-between gap-3">
  <div className="flex-1 text-center sm:text-left">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
      Comments
    </p>
    <p className="mt-1 text-[11px] text-slate-400">
      Share a reflection, a question, or a disagreement.
    </p>
  </div>
  


        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-200 shadow-inner">
            {totalCount} comments
          </span>
          <div className="flex rounded-full bg-slate-900/80 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setSortMode("top")}
              className={classNames(
                "px-3 py-1 rounded-full",
                sortMode === "top"
                  ? "bg-sky-500 text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-sky-200"
              )}
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => setSortMode("latest")}
              className={classNames(
                "px-3 py-1 rounded-full",
                sortMode === "latest"
                  ? "bg-sky-500 text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-sky-200"
              )}
            >
              Latest
            </button>
          </div>
        </div>
      </div>

      {/* composer banners */}
      <div className="mb-2 space-y-2">
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-300">
            <span>
              Replying to{" "}
              <span className="font-semibold">
                {replyTo.user?.name ||
                  `User ${replyTo.user?.id ?? replyTo.userId}`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              Cancel reply
            </button>
          </div>
        )}
        {editing && (
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-300">
            <span>Editing your comment</span>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              Cancel edit
            </button>
          </div>
        )}
      </div>

     {/* composer pill */}
<div className="mb-4">
  <div className="relative flex items-start">
    {/* avatar overlapping pill */}
    <div className="absolute -left-3 top-1.5 h-8 w-8 rounded-full border-2 border-slate-950 bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-semibold text-slate-900 shadow-md">
      {currentUserAvatar ? (
        <img
          src={currentUserAvatar}
          alt={currentUserName}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{currentUserInitials}</span>
      )}
    </div>

    <div className="ml-6 flex-1">
      <div className="flex items-center gap-2 rounded-[25px] border border-slate-500/70 bg-slate-900/80 px-4 py-1.5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={1}
          placeholder={
            isLoggedIn
              ? "Share a reflection, a question, or a disagreement"
              : "Log in to comment"
          }
          disabled={!isLoggedIn}
          className={classNames(
            "flex-1 bg-transparent resize-none text-sm text-slate-100 outline-none placeholder-slate-400 min-h-[80px] max-h-[64px]",
            !isLoggedIn && "cursor-not-allowed opacity-60"
          )}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 64)}px`;
          }}
        />

        {/* emoji / GIF toggle */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[16px] text-sky-300 hover:bg-slate-700"
        >
          🙂
        </button>

        {/* arrow-only post button */}
        <button
          type="button"
          disabled={submitting || (!body.trim() && !gifUrl)}
          onClick={handleSubmit}
          className={classNames(
            "h-8 w-8 rounded-full flex items-center justify-center text-slate-950 text-sm font-bold shadow-md transition-colors",
            submitting || (!body.trim() && !gifUrl)
              ? "bg-sky-500/40 cursor-not-allowed"
              : "bg-sky-500 hover:bg-sky-400"
          )}
        >
          ↑
        </button>
      </div>

      {gifUrl && (
  <div className="mt-2 p-2 bg-slate-900/60 border border-slate-700 rounded-2xl">
    <img
      src={gifUrl}
      alt="Selected gif"
      className="max-w-[200px] max-h-[160px] object-cover rounded-lg border border-slate-700 mx-auto"
    />
    <button
      type="button"
      onClick={() => setGifUrl(null)}
      className="mt-1 block mx-auto text-xs text-slate-400 hover:text-slate-200"
    >
      Remove GIF
    </button>
  </div>
)}

    </div>
  </div>
</div>


      {/* error */}
      {error && (
        <div className="mb-2 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* scrollable comments area inside card */}
      <div className="mt-1 max-h-[340px] sm:max-h-[420px] overflow-y-auto picker-scroll pr-1">
        {loading ? (
          <p className="py-4 text-xs text-slate-400">Loading comments…</p>
        ) : tree.length === 0 ? (
          <p className="py-4 text-xs text-slate-500">
            No comments yet. Start the conversation.
          </p>
        ) : (
          <div className="sm:divide-y sm:divide-slate-800">
           {tree.map((node: any) => (
  <CommentItem
    key={node.id}
    node={node}
    depth={0}
    isLiked={!!node.likedByMeLocal}
    currentUserId={currentUserId}
    onReply={handleReply}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onToggleLike={handleToggleLike}
    isAuthorOwner={isAuthorOwner}
    onTogglePin={handleTogglePin}   // ✅ correct
    authorId={authorId}            // ✅ add this line
  />
))}

          </div>
        )}
      </div>

      {/* unified picker overlay */}
      <InlinePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onEmojiSelect={(emoji) => setBody((prev) => prev + emoji)}
        onGifSelect={(url) => setGifUrl(url)}
      />
    </section>
  );
}
