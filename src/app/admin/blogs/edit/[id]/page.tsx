// src/app/admin/blogs/edit/[id]/page.tsx
import { notFound } from "next/navigation";
import EditBlogForm from "./EditBlogForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
};

type PageProps = {
  // Next 16: params is a Promise
  params: Promise<{ id: string }>;
};

async function fetchAdminPost(id: string): Promise<AdminPost | null> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${API_BASE_URL}/blogs/admin/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Failed to fetch admin post");
  }

  return res.json();
}

export const revalidate = 0;

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;

  const post = await fetchAdminPost(id);
  if (!post) {
    notFound();
  }

  // Pass full post (including HTML content) into client component
  return <EditBlogForm initialPost={post} />;
}

