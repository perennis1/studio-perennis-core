import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { getPrivateReadingStats } from "../../lib/analytics/privateReadingAnalyticsService.js";

const router = express.Router();

router.get("/me/analytics/reading", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const stats = await getPrivateReadingStats({ userId });

  res.json(stats);
});

export default router;
