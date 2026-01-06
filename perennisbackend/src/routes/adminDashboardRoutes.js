import express from "express";
import prisma from "../lib/prisma.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

router.get("/dashboard", adminOnly, async (req, res) => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    activeReaders,
    reflectionFlags,
    lockedCurriculum,
    activeBooks,
    activeCourses,
  ] = await Promise.all([
    prisma.readingSession.count({
      where: {
        state: "ACTIVE",
        lastActiveAt: { gte: since24h },
      },
    }),

    prisma.reflectionAnswer.count({
      where: {
        flagged: true,
        createdAt: { gte: since24h },
      },
    }),

    prisma.curriculumProgress.count({
      where: {
        state: "LOCKED",
      },
    }),

    prisma.book.count({
      where: {
        type: "CURRICULUM",
      },
    }),

    prisma.course.count({
      where: {
        status: "PUBLISHED",
      },
    }),
  ]);

  res.json({
    system: {
      activeReaders,
      reflectionFlags,
      lockedCurriculum,
    },
    content: {
      activeBooks,
      activeCourses,
    },
  });
});

export default router;
