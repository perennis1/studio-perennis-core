//C:\Users\studi\my-next-app\perennisbackend\src\routes\lessonProgressRoutes.js

import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { emitLearningEvent } from "../lib/learning/emitLearningEvent.js"; // ✅ ADD

const router = express.Router();

/**
 * POST /api/lessons/:lessonId/progress
 */
router.post("/lessons/:lessonId/progress", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const lessonId = Number(req.params.lessonId);
  const { positionSec, deltaSec } = req.body;

  if (
    !lessonId ||
    typeof positionSec !== "number" ||
    typeof deltaSec !== "number"
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      lastPositionSec: Math.floor(positionSec),
      watchedSeconds: { increment: Math.max(0, Math.floor(deltaSec)) },
    },
    create: {
      userId,
      lessonId,
      lastPositionSec: Math.floor(positionSec),
      maxPositionSec: Math.floor(positionSec),
      watchedSeconds: Math.floor(deltaSec),
    },
  });

  // 🔹 Phase 8.4.3 — mirror into LearningEvent
  await emitLearningEvent({
    userId,
    surfaceType: "LESSON",
    surfaceId: lessonId,
    eventType: "LESSON_PROGRESS",
    position: Math.floor(positionSec),
    delta: Math.floor(deltaSec),
  });

  res.json({ success: true });
});

export default router;
