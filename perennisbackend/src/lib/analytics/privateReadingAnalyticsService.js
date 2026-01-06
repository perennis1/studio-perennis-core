import prisma from "../prisma.js";

/**
 * Private reading analytics.
 * User-only. Never teacher-visible.
 */
export async function getPrivateReadingStats({ userId }) {
  const sessions = await prisma.readingSession.findMany({
    where: {
      userId,
      book: { type: "GENERAL" },
    },
    select: {
      bookId: true,
      startedAt: true,
      lastActiveAt: true,
    },
  });

  return {
    booksRead: sessions.length,
    lastReadAt:
      sessions.length > 0
        ? sessions.sort(
            (a, b) => b.lastActiveAt - a.lastActiveAt
          )[0].lastActiveAt
        : null,
  };
}
