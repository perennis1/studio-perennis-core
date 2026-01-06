
//C:\Users\studi\my-next-app\perennisbackend\src\lib\analytics\adminDashboardService.js

import prisma from "../prisma.js";

export async function getAdminDashboardSnapshot() {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    activeReaders,
    reflectionFlags,
    lockedCurriculum,
    activeBooksGrouped,
    activeCoursesGrouped,
  ] = await Promise.all([
    prisma.readingSession.count({
      where: { lastActiveAt: { gte: since24h } },
    }),

    prisma.reflectionAnswer.count({
      where: { flagged: true },
    }),

    prisma.activityEvent.count({
      where: {
        action: "CURRICULUM_LOCKED",
        createdAt: { gte: since24h },
      },
    }),

    // groupBy internally — return number only
    prisma.readingSession.groupBy({
      by: ["bookId"],
      where: { lastActiveAt: { gte: since24h } },
    }),

    prisma.courseEnrollment.groupBy({
      by: ["courseId"],
    }),
  ]);

  return {
    system: {
      activeReaders,
      reflectionFlags,
      lockedCurriculum,
    },
    content: {
      activeBooks: activeBooksGrouped.length,
      activeCourses: activeCoursesGrouped.length,
    },
  };
}
