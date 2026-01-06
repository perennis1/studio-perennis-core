//C:\Users\studi\my-next-app\perennisbackend\src\routes\lessonTimelineRoutes.js

import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { emitLearningEvent } from "../lib/learning/emitLearningEvent.js"; // ✅ ADD

const router = express.Router();

/**
 * POST /api/lessons/:lessonId/timeline
 */
router.post("/lessons/:lessonId/timeline", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const lessonId = Number(req.params.lessonId);
  const { second, label } = req.body;

  if (!lessonId || typeof second !== "number") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  await prisma.lessonTimelineEvent.create({
    data: {
      userId,
      lessonId,
      second: Math.floor(second),
      label: label || null,
    },
  });

  // 🔹 Phase 8.4.3 — mirror into LearningEvent
  await emitLearningEvent({
    userId,
    surfaceType: "LESSON",
    surfaceId: lessonId,
    eventType: "LESSON_TIMELINE_SEEK",
    position: Math.floor(second),
    metadata: label ? { label } : null,
  });

  res.json({ success: true });
});

export default router;
