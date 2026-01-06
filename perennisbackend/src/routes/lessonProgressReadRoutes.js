import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/lessons/:lessonId/progress
 * Returns interpreted progress snapshot
 */
router.get(
  "/lessons/:lessonId/progress",
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;
    const lessonId = Number(req.params.lessonId);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { durationSec: true },
    });

    if (!lesson || !lesson.durationSec) {
      return res.json({ progress: null });
    }

    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (!progress) {
      return res.json({
        watchedPercent: 0,
        resumeAt: 0,
        engagementState: "NOT_STARTED",
      });
    }

    const watchedPercent = Math.min(
      100,
      Math.round(
        (progress.maxPositionSec / lesson.durationSec) * 100
      )
    );

    let engagementState = "IN_PROGRESS";
    if (watchedPercent >= 90) engagementState = "NEAR_COMPLETE";
    if (watchedPercent >= 100) engagementState = "COMPLETE";

    res.json({
      watchedPercent,
      resumeAt: progress.lastPositionSec,
      engagementState,
    });
  }
);

export default router;
