//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\curriculumAnalyticsRoutes.js

import express from "express";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { getCurriculumReadingStats } from "../../lib/analytics/curriculumAnalyticsService.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/analytics/curriculum/books/:bookId", async (req, res) => {
  const bookId = Number(req.params.bookId);
  const cohortId = req.query.cohortId ? Number(req.query.cohortId) : null;

  const stats = await getCurriculumReadingStats({ bookId, cohortId });
  res.json(stats);
});

export default router;
