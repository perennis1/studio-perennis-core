// perennisbackend/src/routes/admin/readingLiveRoutes.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { getCurrentCurriculumStep } from "../../lib/curriculum/curriculumService.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/live", async (_req, res) => {
  const since = new Date(Date.now() - 15 * 60 * 1000);

  const sessions = await prisma.readingSession.findMany({
    where: { state: "ACTIVE", lastActiveAt: { gte: since } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, type: true } },
    },
    orderBy: { lastActiveAt: "desc" },
  });

  res.json({
    sessions: await Promise.all(
      sessions.map(async (s) => ({
        ...s,
        curriculumStep: await getCurrentCurriculumStep({
          userId: s.userId,
          bookId: s.bookId,
          cohortId: s.cohortId,
        }),
      }))
    ),
  });
});

export default router;
