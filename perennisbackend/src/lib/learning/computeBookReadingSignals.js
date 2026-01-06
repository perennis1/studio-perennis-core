







/**
 * ❄️ INTELLIGENCE LAYER — FROZEN
 * These signals are observational.
 * Do NOT extend metrics or schemas without explicit versioning.
 */






import prisma from "../prisma.js";

export async function computeBookReadingSignals({ userId, bookId }) {
  const sessions = await prisma.readingSession.findMany({
    where: { userId, bookId },
  });

  if (sessions.length === 0) return;

  const totalSessions = sessions.length;

  const pagesRead = sessions.reduce(
    (sum, s) => sum + (s.furthestAllowedPage || 0),
    0
  );

  const avgSessionDepth =
    totalSessions > 0 ? pagesRead / totalSessions : null;

  const gatesHit = await prisma.learningEvent.count({
    where: {
      userId,
      surfaceType: "BOOK",
      surfaceId: bookId,
      eventType: "REFLECTION_GATE_HIT",
    },
  });

  const reflections = await prisma.reflectionAnswer.findMany({
    where: { userId, gate: { bookId } },
  });

  const reflectionChars = reflections.reduce(
    (sum, r) => sum + r.text.length,
    0
  );

  const gateFriction =
    pagesRead > 0 ? gatesHit / pagesRead : null;

  const reflectionDensity =
    pagesRead > 0 ? reflectionChars / pagesRead : null;

  await prisma.bookReadingSignal.upsert({
    where: { userId_bookId: { userId, bookId } },
    update: {
      totalSessions,
      totalPagesRead: pagesRead,
      avgSessionDepth,
      gateFriction,
      reflectionDensity,
      computedAt: new Date(),
    },
    create: {
      userId,
      bookId,
      totalSessions,
      totalPagesRead: pagesRead,
      avgSessionDepth,
      gateFriction,
      reflectionDensity,
    },
  });
}
