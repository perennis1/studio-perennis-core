// src/app/admin/blogs/edit/[id]/EditBlogForm.tsx
// src/app/admin/blogs/edit/[id]/EditBlogForm.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

type AdminPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status: "DRAFT" | "PUBLISHED";
  category?: string | null;
  type?: string | null;
  deleted?: boolean;
  deletedAt?: string | null;
};

type Props = {
  initialPost: AdminPost;
};

export default function EditBlogForm({ initialPost }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [focusMode, setFocusMode] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // Core fields
  const [title, setTitle] = useState(initialPost.title);
  const [slug, setSlug] = useState(initialPost.slug);
  const [body, setBody] = useState(initialPost.content || "");
  const [excerpt, setExcerpt] = useState(initialPost.excerpt || "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialPost.coverImageUrl || ""
  );
  const [category, setCategory] = useState(initialPost.category || "");
  const [type, setType] = useState(initialPost.type || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialPost.status
  );

  // Autosave state
  const [dirty, setDirty] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Error / manual save label
  const [error, setError] = useState<string | null>(null);
  const [savingLabel, setSavingLabel] = useState<string | null>(null);

  const handleSave = (nextStatus: "DRAFT" | "PUBLISHED") => {
    setError(null);
    setSavingLabel(
      nextStatus === "PUBLISHED" ? "Publishing…" : "Saving draft…"
    );

    startTransition(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs/${initialPost.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              slug,
              excerpt,
              coverImageUrl,
              category,
              type,
              content: body, // FULL HTML from TipTap
              status: nextStatus,
            }),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({} as any));
          throw new Error((data as any)?.message || "Failed to update post");
        }

        setStatus(nextStatus);
        setSavingLabel(null);
        setDirty(false);
        setLastSavedAt(new Date());
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Unexpected error");
        setSavingLabel(null);
      }
    });
  };

     const viewPublic = () => {
    if (status !== "PUBLISHED") return;

    if (typeof globalThis === "undefined") return;

    const g = globalThis as any;
    if (!g.window) return;

    g.window.open(`/blogs/${slug}`, "_blank");
  };


   const loadVersions = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blogs/admin/${initialPost.id}/versions`
    );
    const data = (await res.json()) as any[]; // or a proper Version[] type
    setVersions(data);
  };


  // AUTOSAVE EFFECT – fires after 8s of no changes when dirty=true
  useEffect(() => {
    if (!dirty) return;
    if (!process.env.NEXT_PUBLIC_API_URL) return;

    const timeout = setTimeout(async () => {
      try {
        setIsAutoSaving(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs/${initialPost.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              slug,
              excerpt,
              coverImageUrl,
              category,
              type,
              content: body,
              status, // keep current status
            }),
          }
        );

        if (res.ok) {
          setLastSavedAt(new Date());
          setDirty(false);
        } else {
          console.error("Autosave failed", await res.text());
        }
      } catch (err) {
        console.error("Autosave error", err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 8000); // 8 seconds after last change

    return () => clearTimeout(timeout);
  }, [
    dirty,
    title,
    slug,
    body,
    excerpt,
    coverImageUrl,
    category,
    type,
    status,
    initialPost.id,
  ]);

  const handleSoftDelete = async () => {
    const g = globalThis as any;
    const confirmed =
      typeof globalThis !== "undefined" &&
      g.window &&
      g.window.confirm("Soft delete this post? It can be restored later.");

    if (!confirmed) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/admin/${initialPost.id}/soft`,
        { method: "DELETE" }
      );

      router.push("/admin/blogs");
    } catch {
      if (g.window) {
        g.window.alert("Soft delete failed.");
      }
    }
  };

  const handlePermanentDelete = async () => {
    const g = globalThis as any;
    const answer =
      typeof globalThis !== "undefined" &&
      g.window &&
      g.window.prompt("Type DELETE to permanently destroy this post:");

    if (answer !== "DELETE") return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/admin/${initialPost.id}/hard`,
        { method: "DELETE" }
      );

      router.push("/admin/blogs");
    } catch {
      if (g.window) {
        g.window.alert("Permanent delete failed.");
      }
    }
  };


  return (
    <>
      {/* MAIN PAGE */}
      <div className="min-h-screen bg-[#020617] pt-32 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          {/* Sticky top bar */}
          <div className="sticky top-20 z-30 mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Edit article
              </p>
              <p className="text-sm font-medium text-slate-100">
                {initialPost.title}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Autosave / save label */}
              <span className="hidden md:inline text-[11px] text-slate-500">
                {savingLabel
                  ? savingLabel
                  : isAutoSaving
                  ? "Saving…"
                  : lastSavedAt
                  ? `Saved at ${lastSavedAt.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Autosave on"}
              </span>

              <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                {status === "PUBLISHED" ? "Published" : "Draft"}
              </span>

              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={isPending}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:border-slate-500 disabled:opacity-60"
              >
                Save draft
              </button>

              <button
                type="button"
                onClick={() => handleSave("PUBLISHED")}
                disabled={isPending}
                className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
              >
                Publish
              </button>

              <button
                type="button"
                onClick={viewPublic}
                disabled={status !== "PUBLISHED"}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs font-medium text-slate-200 hover:border-slate-400 disabled:opacity-40"
              >
                View public
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVersions(true);
                  loadVersions();
                }}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-slate-400"
              >
                History
              </button>

              <button
                type="button"
                onClick={handleSoftDelete}
                className="rounded-full border border-red-600/60 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
              >
                Delete
              </button>

              {initialPost.deleted && (
                <button
                  type="button"
                  onClick={handlePermanentDelete}
                  className="rounded-full border border-red-700 bg-red-700/20 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-700/40"
                >
                  Delete Forever
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Main layout: left = editor + meta, right = live preview */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
            {/* LEFT COLUMN: editor + meta stacked */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Title
                </label>
                <input
       value={title}
  onChange={(e) => {
    const target = e.currentTarget as HTMLInputElement;
    setTitle(target.value);
    setDirty(true);
  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Content + focus mode button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setFocusMode(true)}
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-sky-400 hover:text-sky-200"
                  >
                    Focus mode
                  </button>
                </div>

                <RichTextEditor
                  content={body}
                  onChange={(html) => {
                    setBody(html);
                    setDirty(true);
                  }}
                />
              </div>

              {/* META CARDS (was right column) */}
              <div className="space-y-4">
                {/* Slug */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Slug
                  </label>
                  <input
      value={slug}
  onChange={(e) => {
    const target = e.currentTarget as HTMLInputElement;
    setSlug(target.value);
    setDirty(true);
  }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    URL: /blogs/{slug || "<slug>"}
                  </p>
                </div>

                {/* Excerpt */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Excerpt
                  </label>
                  <textarea
       value={excerpt}
  onChange={(e) => {
    const target = e.currentTarget as HTMLTextAreaElement;
    setExcerpt(target.value);
    setDirty(true);
  }}
                    rows={3}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Short description used on cards and hero.
                  </p>
                </div>

                {/* Cover image */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Cover image URL
                    </label>
                    <input
              value={coverImageUrl}
  onChange={(e) => {
    const target = e.currentTarget as HTMLInputElement;
    setCoverImageUrl(target.value);
    setDirty(true);
  }}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  {coverImageUrl && (
                    <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/80 p-2">
                      <p className="mb-1 text-[11px] text-slate-500">
                        Preview
                      </p>
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        className="max-h-40 w-full rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Category + Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Category
                    </label>
                    <input
              value={category}
  onChange={(e) => {
    const target = e.currentTarget as HTMLInputElement;
    setCategory(target.value);
    setDirty(true);
  }}
                      placeholder="Thinking, Education…"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Type
                    </label>
                    <input
               value={type}
  onChange={(e) => {
    const target = e.currentTarget as HTMLInputElement;
    setType(target.value);
    setDirty(true);
  }}
                      placeholder="Essay, Reflection…"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: live preview (desktop / xl only) */}
            <aside className="hidden xl:block rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                  Live preview
                </p>
                <p className="text-[10px] text-slate-500">
                  Matches public blog layout
                </p>
              </div>

              <div className="mt-3 h-[calc(100vh-260px)] overflow-y-auto pr-2">
                {coverImageUrl && (
                  <div className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-black/60">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="h-52 w-full object-cover"
                    />
                  </div>
                )}

                <article className="rich-article-wrapper">
                  <header className="mb-6">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      {type || "Essay"} · {category || "Thinking"}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
                      {title || "Untitled article"}
                    </h1>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Preview only · changes appear here instantly, but are not
                      published until you click{" "}
                      <span className="font-semibold">Publish</span>.
                    </p>
                  </header>

                  {body.trim() ? (
                    <section
                      className="rich-article"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  ) : (
                    <p className="mt-6 text-sm italic text-slate-600">
                      Start writing in the editor to see the live preview here.
                    </p>
                  )}
                </article>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* FOCUS MODE OVERLAY */}
      {focusMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl">
            {/* Top bar inside focus mode */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Focus mode
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFocusMode(false)}
                  className="rounded-full border border-slate-600 px-3 py-1 text-[11px] text-slate-200 hover:border-sky-400 hover:text-sky-200"
                >
                  Close
                </button>
              </div>
            </div>

            {showVersions && (
              <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center">
                <div className="bg-slate-950 border border-slate-700 rounded-xl w-full max-w-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Version history
                    </h3>
                    <button
                      onClick={() => setShowVersions(false)}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Close
                    </button>
                  </div>

                  {versions.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No versions saved yet.
                    </p>
                  )}

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {versions.map((v) => (
                      <div
                        key={v.id}
                        className="border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex justify-between items-center"
                      >
                        <div>
                          <p>
                            {new Date(v.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <button
                          onClick={async () => {
                            const confirmed =
                              typeof window !== "undefined" &&
                              window.confirm(
                                "Restore this version? Current changes will be overwritten."
                              );
                            if (!confirmed) return;

                            await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/blogs/admin/versions/${v.id}/restore`,
                              { method: "POST" }
                            );

                            if (typeof window !== "undefined") {
                              window.location.reload();
                            }
                          }}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable editor area */}
            <div className="h-[72vh] overflow-y-auto pr-1">
              <RichTextEditor
                content={body}
                onChange={(html) => {
                  setBody(html);
                  setDirty(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
