//C:\Users\studi\my-next-app\src\app\api\reading-progress\route.ts


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { canAccessBook } from "@/lib/accessControl";

/**
 * SAVE reading progress
 * 🔒 User must own the book
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = auth.user.id;
    const body = await req.json();
    const { bookId, pageNumber, totalPages, progress } = body;

    if (!bookId || !totalPages) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const allowed = await canAccessBook(userId, bookId);
    if (!allowed) {
      return NextResponse.json(
        { error: "No access to this book" },
        { status: 403 }
      );
    }

    await prisma.readingProgress.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: {
        pageNumber,
        totalPages,
        progress,
        updatedAt: new Date(),
      },
      create: {
        userId,
        bookId,
        pageNumber,
        totalPages,
        progress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("READING PROGRESS POST ERROR", err);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

/**
 * GET reading progress
 * 🔒 User must own the book
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = auth.user.id;
    const { searchParams } = new URL(req.url);
    const bookId = Number(searchParams.get("bookId"));

    if (!bookId) {
      return NextResponse.json(
        { error: "Missing bookId" },
        { status: 400 }
      );
    }

    const allowed = await canAccessBook(userId, bookId);
    if (!allowed) {
      return NextResponse.json(
        { error: "No access to this book" },
        { status: 403 }
      );
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    return NextResponse.json(progress ?? null);
  } catch (err) {
    console.error("READING PROGRESS GET ERROR", err);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
