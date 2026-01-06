// src/app/blogs/page.tsx
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type BlogListPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  category?: string | null;
  type?: string | null; // Essay, Reflection, Note, etc.
  content?: string | null; // optional, for hero fallback text
};

type PageProps = {
  // Next.js 16: searchParams is a Promise
  searchParams: Promise<{ q?: string }>;
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function fetchPosts(q?: string): Promise<BlogListPost[]> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  let url = `${API_BASE_URL}/blogs`;
  if (q) {
    url += `?q=${encodeURIComponent(q)}`;
  }

  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  return res.json();
}

const CATEGORIES = [
  'All',
  'Thinking',
  'Education',
  'Life',
  'Technology',
  'Philosophy',
];

export const revalidate = 0;

export default async function BlogsPage({ searchParams }: PageProps) {
  // Next 16: unwrap the Promise first
  const params = await searchParams;
  const q = params.q?.trim() || '';

  const posts = await fetchPosts(q);
  const [featuredPost, ...otherPosts] = posts;

  const heroImage =
    featuredPost?.coverImageUrl || '/blogs/home.png'; // your fallback hero

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 pb-16 lg:py-14">
        {/* Top: Hero + Search */}
        <section className="flex flex-col gap-8 lg:flex-row">
          {/* Hero banner */}
          <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-950">
            {/* Background image overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/10" />

            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-300/80">
                  New
                  <span className="ml-2 h-1 w-1 rounded-full bg-emerald-400" />
                </span>

                <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  {featuredPost
                    ? featuredPost.title
                    : 'Studio Perennis — Reflections in the dark'}
                </h1>

                <p className="max-w-xl text-sm text-slate-300/90 sm:text-base line-clamp-3">
                  {featuredPost?.excerpt ||
                    (featuredPost?.content
                      ? featuredPost.content.slice(0, 180) + '...'
                      : 'Long–form reflections on thinking, learning, and the inner life. Curated essays from Studio Perennis.')}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300/80">
                {featuredPost && (
                  <>
                    <span>
                      {formatDate(
                        featuredPost.publishedAt || featuredPost.createdAt,
                      )}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-500" />
                    <span>Featured article</span>
                    <span className="h-1 w-1 rounded-full bg-slate-500" />
                    <span>~ 5–10 min read</span>
                    <Link
                      href={`/blogs/${featuredPost.slug}`}
                      className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
                    >
                      Read now
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </Link>
                  </>
                )}
                {!featuredPost && (
                  <span className="text-xs text-slate-400">
                    Publish your first post and it will appear here.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search + filters */}
          <div className="w-full max-w-lg space-y-5 lg:max-w-sm">
            {/* Search */}
            <form
              action="/blogs"
              method="GET"
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
            >
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Search articles
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-slate-950/70 px-3 py-2 ring-1 ring-slate-700/80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-none text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
                  />
                </svg>
                <input
                  defaultValue={q}
                  name="q"
                  placeholder="Search reflections, essays, or ideas..."
                  className="h-9 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                {q && (
                  <Link
                    href="/blogs"
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>

            {/* Category pills (visual only for now) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Browse topics
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat, index) => (
                  <button
                    key={cat}
                    type="button"
                    className={[
                      'rounded-full border px-3 py-1 text-xs transition',
                      index === 0
                        ? 'border-sky-400/80 bg-sky-500/20 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.5)]'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80',
                    ].join(' ')}
                    disabled
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Categories UI is ready. We can hook this to real categories in
                your Post model whenever you want.
              </p>
            </div>
          </div>
        </section>

        {/* Grid of cards */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              All articles
            </h2>
            {posts.length > 0 && (
              <p className="text-xs text-slate-500">
                {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
                {q ? ` matching “${q}”` : ''}
              </p>
            )}
          </div>

          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-sm text-slate-400">
              No posts found
              {q ? ` for “${q}”.` : '.'} Write and publish your first article
              from the admin side and it will appear here.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {otherPosts.map((post) => {
                const dateLabel = formatDate(
                  post.publishedAt || post.createdAt,
                );

                return (
                  <Link
                    key={post.id}
                    href={`/blogs/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-[0_18px_40px_rgba(0,0,0,0.75)] transition hover:-translate-y-1 hover:border-slate-500/80 hover:bg-slate-900/90"
                  >
                    {/* Image */}
                    <div className="relative h-40 w-full overflow-hidden">
                      <div
                        className="absolute inset-0 bg-slate-900/40"
                        style={{
                          backgroundImage: `url(${
                            post.coverImageUrl || '/blogs/pig1.png'
                          })`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{dateLabel}</span>
                        <span className="flex items-center gap-1">
                          <span>•</span>
                          <span>~5 min read</span>
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-slate-50 group-hover:text-white">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="mt-2 line-clamp-3 text-xs text-slate-400">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                          <span>Studio Perennis</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-slate-500" />
                          <span>{post.type || 'Reflection'}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
