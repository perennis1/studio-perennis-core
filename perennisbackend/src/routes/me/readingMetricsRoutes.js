// src/routes/me/readingMetricsRoutes.js
import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import {
  computeCompletionVelocity,
  computeHabitMetrics,
} from "../../lib/reading/readingMetricsService.js";

const router = express.Router();

/**
 * GET /me/reading/metrics?bookId=123
 */
router.get("/reading/metrics", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const bookId = Number(req.query.bookId);

  if (!bookId) {
    return res.status(400).json({ error: "bookId required" });
  }

  const sessions = await prisma.readingSession.findMany({
    where: { userId, bookId },
    select: {
      createdAt: true,
      lastActiveAt: true,
      lastSeenPage: true,
      state: true,
    },
  });

  const velocity = computeCompletionVelocity(sessions);
  const habit = computeHabitMetrics(sessions);

  res.json({ velocity, habit });
});

export default router;
