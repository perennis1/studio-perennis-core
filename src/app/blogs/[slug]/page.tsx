// src/app/blogs/[slug]/page.tsx
import { notFound } from "next/navigation";
import InteractionsBar from "@/components/blog/InteractionsBar";
import CommentsSection from "@/components/blog/CommentsSection";
import ShareBar from "@/components/blog/ShareBar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt: string;
  category?: string | null;
  type?: string | null;
  author?: {
    id: number;
    name?: string | null;
    avatar?: string | null;
    tagline?: string | null;
  } | null;
  _count?: {
    likes: number;
    bookmarks: number;
    comments: number;
  };
  likedByMe?: boolean;   // NEW
  savedByMe?: boolean;   // NEW
};

// Next 16: params is a Promise
type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

async function fetchPost(slug: string): Promise<BlogPost | null> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Failed to fetch blog post");
  }

  return res.json();
}

export const revalidate = 0;

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const post = await fetchPost(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content || "");
  const dateLabel = formatDate(post.publishedAt || post.createdAt);

  const likeCount = post._count?.likes ?? 0;
  const bookmarkCount = post._count?.bookmarks ?? 0;
  const commentCount = post._count?.comments ?? 0;

  const initialLiked = post.likedByMe ?? false;
  const initialSaved = post.savedByMe ?? false;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-60">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <article className="rich-article-wrapper">
          <header className="mb-6 border-b border-slate-800 pb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {post.type || "Reflection"} · {post.category || "Uncategorized"}
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              {post.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>{dateLabel}</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>{readingTime}</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>Studio Perennis</span>
            </div>

            {/* Share icons row */}
            <div className="mt-4">
              <ShareBar title={post.title} slug={post.slug} />
            </div>

            {/* Interaction bar just under share */}
            <InteractionsBar
              postId={post.id}
              slug={post.slug}
              initialLikes={likeCount}
              initialBookmarks={bookmarkCount}
              initialComments={commentCount}
            initialLiked={post.likedByMe ?? false}
initialSaved={post.savedByMe ?? false}
            />
          </header>

          {/* Body from TipTap (HTML) */}
          <section
            className="rich-article"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          {/* Full comments UI */}
          {/* Full comments UI */}
<CommentsSection
  postId={post.id}
  slug={post.slug}
  authorId={post.author?.id ?? 0}
  initialCount={commentCount}
/>

        </article>
      </div>
    </div>
  );
}
