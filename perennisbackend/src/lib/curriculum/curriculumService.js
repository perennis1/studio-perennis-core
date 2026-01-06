import prisma from "../prisma.js";

/**
 * Returns the first locked step for a user
 */
export async function getCurrentCurriculumStep({
  userId,
  bookId,
  cohortId,
}) {
  const steps = await prisma.curriculumStep.findMany({
    where: {
      active: true,
      OR: [
        { cohortId: cohortId ?? null },
        { cohortId: null },
      ],
    },
    orderBy: { order: "asc" },
  });

  for (const step of steps) {
    const completed = await isStepCompleted(
      step,
      userId,
      bookId
    );

    if (!completed) {
      return step;
    }
  }

  return null; // curriculum finished
}

async function isStepCompleted(step, userId, bookId) {
  switch (step.type) {
    case "BOOK_SEGMENT": {
      const segment = await prisma.bookSegment.findUnique({
        where: { id: step.refId },
      });

      const session = await prisma.readingSession.findFirst({
        where: { userId, bookId, state: "ACTIVE" },
        orderBy: { startedAt: "desc" },
      });

      return (
        session &&
        session.lastSeenPage >= segment.endPage
      );
    }

    case "REFLECTION_GATE": {
      const answer =
        await prisma.reflectionAnswer.findFirst({
          where: {
            gateId: step.refId,
            userId,
          },
        });

      return !!answer;
    }

    case "LESSON": {
      const activity =
        await prisma.activityEvent.findFirst({
          where: {
            userId,
            entityType: "LESSON",
            entityId: Number(step.refId),
            action: "COMPLETED",
          },
        });

      return !!activity;
    }

    default:
      return false;
  }
}
