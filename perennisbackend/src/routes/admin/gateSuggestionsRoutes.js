//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\gateSuggestionsRoutes.js
import express from "express";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { getGateSuggestions } from "../../lib/analytics/gateSuggestionService.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/books/:bookId", async (req, res) => {
  const bookId = Number(req.params.bookId);
  const cohortId = req.query.cohortId ? Number(req.query.cohortId) : null;
  res.json(await getGateSuggestions({ bookId, cohortId }));
});

export default router;
