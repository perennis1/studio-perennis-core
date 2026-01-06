import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /me/activity
 */
router.get("/activity", verifyToken, async (req, res) => {
  const events = await prisma.activityEvent.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(events);
});

export default router;
