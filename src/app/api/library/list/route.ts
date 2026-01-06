

//C:\Users\studi\my-next-app\src\app\api\library\list\route.ts


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { entries: [] },
        { status: 401 }
      );
    }

    const userId = auth.user.id;

    const entries = await prisma.libraryEntry.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            author: true,
          },
        },
      },
      orderBy: { acquiredAt: "desc" },
    });

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        bookId: e.bookId,
        format: e.format,
        acquiredAt: e.acquiredAt,
        book: e.book,
      })),
    });
  } catch (err) {
    console.error("LIBRARY LIST ERROR", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
