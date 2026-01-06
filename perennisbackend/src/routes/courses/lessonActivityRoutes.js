//C:\Users\studi\my-next-app\perennisbackend\src\routes\courses\lessonActivityRoutes.js
import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { emitLearningEvent } from "../../lib/learning/emitLearningEvent.js"; // ✅ ADD

const router = express.Router();

/**
 * POST /api/lessons/:lessonId/open
 */
router.post("/lessons/:lessonId/open", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const lessonId = Number(req.params.lessonId);

  if (!lessonId) {
    return res.status(400).json({ error: "Invalid lessonId" });
  }

  const existing = await prisma.activityEvent.findFirst({
    where: {
      userId,
      entityType: "LESSON",
      entityId: lessonId,
      action: "STARTED",
    },
  });

  if (existing) {
    return res.json({ startedAt: existing.createdAt });
  }

  const event = await prisma.activityEvent.create({
    data: {
      userId,
      entityType: "LESSON",
      entityId: lessonId,
      action: "STARTED",
    },
  });

  // 🔹 Phase 8.4.3 — mirror into LearningEvent
  await emitLearningEvent({
    userId,
    surfaceType: "LESSON",
    surfaceId: lessonId,
    eventType: "LESSON_OPEN",
  });

  res.json({ startedAt: event.createdAt });
});

export default router;
