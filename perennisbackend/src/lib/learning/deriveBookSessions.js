import prisma from "../prisma.js";

const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes

export async function deriveBookSessions({ userId, bookId }) {
  const events = await prisma.learningEvent.findMany({
    where: {
      userId,
      surfaceType: "BOOK",
      surfaceId: bookId,
    },
    orderBy: { createdAt: "asc" },
  });

  if (events.length === 0) return;

  let lastEventAt = null;
  let sessionActive = false;

  for (const ev of events) {
    const now = ev.createdAt.getTime();

    if (
      !lastEventAt ||
      now - lastEventAt > SESSION_GAP_MS
    ) {
      // new session
      await prisma.learningEvent.create({
        data: {
          userId,
          surfaceType: "BOOK",
          surfaceId: bookId,
          eventType: "BOOK_SESSION_STARTED",
        },
      });
      sessionActive = true;
    }

    if (ev.eventType === "BOOK_GATE_BLOCKED") {
      await prisma.learningEvent.create({
        data: {
          userId,
          surfaceType: "BOOK",
          surfaceId: bookId,
          eventType: "BOOK_SESSION_BLOCKED",
          metadata: ev.metadata,
        },
      });
      sessionActive = false;
    }

    lastEventAt = now;
  }
}
