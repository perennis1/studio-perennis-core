//C:\Users\studi\my-next-app\perennisbackend\src\routes\reflectionRoutes.js


import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { emitLearningEvent } from "../lib/learning/emitLearningEvent.js"; // ✅ ADD


const router = express.Router();

/**
 * POST /api/reflections
 */
router.post("/reflections", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { lessonId, content } = req.body;

  if (!lessonId || !content?.trim()) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const contentLength = content.length;

  const existing = await prisma.reflection.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { id: true, revisionCount: true },
  });

  if (existing) {
    await prisma.reflection.update({
      where: { id: existing.id },
      data: {
        text: content,
        contentLength,
        revisionCount: existing.revisionCount + 1,
      },
    });
  } else {
    await prisma.reflection.create({
      data: {
        userId,
        lessonId,
        text: content,
        contentLength,
        revisionCount: 0,
      },
    });
  }

  // 🔹 Phase 8.4.3 — mirror into LearningEvent
  await emitLearningEvent({
    userId,
    surfaceType: "LESSON",
    surfaceId: lessonId,
    eventType: "LESSON_REFLECTION",
    metadata: { length: contentLength },
  });


  res.json({ success: true });
});

export default router;
