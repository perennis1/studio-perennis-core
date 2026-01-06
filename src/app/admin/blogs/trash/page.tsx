import Link from "next/link";
import { RestoreButton, PermanentDeleteButton } from "@/components/admin/TrashActions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type AdminPost = {
  id: number;
  title: string;
  slug: string;
  deletedAt: string;
  category?: string | null;
  type?: string | null;
};

async function getTrashPosts(): Promise<AdminPost[]> {
  if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined");

  const res = await fetch(`${API_BASE_URL}/blogs/admin/trash`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load trash posts");

  return res.json();
}

export const revalidate = 0;

export default async function TrashPage() {
  const posts = await getTrashPosts();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-32 px-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Trash
            </h1>
            <p className="text-xs text-slate-400">
              Soft-deleted posts. Restore or permanently delete.
            </p>
          </div>

          <Link
            href="/admin/blogs"
            className="text-xs text-slate-400 hover:text-slate-100"
          >
            ← Back to posts
          </Link>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-400">
            Trash is empty. No deleted posts.
          </div>
        )}

        {/* Trash list */}
        <div className="space-y-3">
          {posts.map((post) => {
            const deletedLabel = new Date(post.deletedAt).toLocaleDateString(
              "en-IN",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-100">
                    {post.title}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {post.type || "Reflection"} · {post.category || "Uncategorized"}
                  </p>

                  <p className="text-[11px] text-red-400 mt-1">
                    Deleted: {deletedLabel}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  {/* Restore */}
                  <RestoreButton id={post.id} />

                  {/* Permanent delete */}
                  <PermanentDeleteButton id={post.id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
