import prisma from "../prisma.js";

/**
 * Curriculum-facing analytics.
 * Teachers / Studio only.
 */
export async function getCurriculumReadingStats({ bookId, cohortId }) {
  return prisma.activityEvent.aggregate({
    where: {
      entityType: "BOOK",
      entityId: bookId,
      action: {
        in: ["STARTED", "REFLECTION", "COMPLETED"],
      },
      ...(cohortId && { user: { cohortId } }),
    },
    _count: true,
  });
}
