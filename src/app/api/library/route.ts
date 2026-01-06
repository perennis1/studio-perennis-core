// src/app/api/library/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenOptional } from "@/lib/auth";
import { canAccessBook } from "@/lib/accessControl";
import { verifyToken } from "@/lib/auth";
export async function GET(req: NextRequest) {
  try {
    // Optional auth: locked response if not logged in
    const auth = verifyTokenOptional(req);
    const userId = auth?.id ?? null;

    const bookId = Number(req.nextUrl.searchParams.get("bookId"));
    if (!bookId) {
      return NextResponse.json(
        { error: "Missing bookId" },
        { status: 400 }
      );
    }

    // Fetch public book metadata (always allowed)
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Not logged in → locked
    if (!userId) {
      return NextResponse.json({
        locked: true,
        book,
      });
    }

    const allowed = await canAccessBook(userId, bookId);

    // Logged in but not purchased → locked
    if (!allowed) {
      return NextResponse.json({
        locked: true,
        book,
      });
    }

    // Access granted
    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    return NextResponse.json({
      locked: false,
      book: {
        ...book,
        pdfEndpoint: `/api/books/${bookId}/pdf`,
      },
      progress: progress?.progress ?? 0,
    });
  } catch (err) {
    console.error("LIBRARY ERROR", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

