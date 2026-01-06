//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\reflectionInsightsRoutes.js

import express from "express";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { getReflectionInsights } from "../../lib/analytics/reflectionInsightsService.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/books/:bookId", async (req, res) => {
  const bookId = Number(req.params.bookId);
  const cohortId = req.query.cohortId ? Number(req.query.cohortId) : null;
  res.json(await getReflectionInsights({ bookId, cohortId }));
});

export default router;
