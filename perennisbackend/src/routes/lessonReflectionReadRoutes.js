import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/lessons/:lessonId/reflections
 * Visibility-gated lesson reflections
 */
router.get(
  "/lessons/:lessonId/reflections",
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;
    const lessonId = Number(req.params.lessonId);

    if (!lessonId) {
      return res.status(400).json({ error: "Invalid lessonId" });
    }

    const myReflection = await prisma.reflection.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      select: {
        id: true,
        text: true,
        contentLength: true,
        revisionCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!myReflection) {
      return res.json({
        canSeePeers: false,
        myReflection: null,
        reflections: [],
      });
    }

    const peerReflections = await prisma.reflection.findMany({
      where: {
        lessonId,
        userId: { not: userId },
        deleted: false,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      canSeePeers: true,
      myReflection,
      reflections: peerReflections,
    });
  }
);

export default router;
