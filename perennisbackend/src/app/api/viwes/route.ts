import { NextResponse } from "next/server";

// Super simple in-memory store for demo; use DB for production.
const views: Record<string, number> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "No slug" }, { status: 400 });
  return NextResponse.json({ count: views[slug] || 0 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "No slug" }, { status: 400 });
  views[slug] = (views[slug] || 0) + 1;
  return NextResponse.json({ count: views[slug] });
}
