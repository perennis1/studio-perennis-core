import express from "express";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { getActivityStream } from "../../lib/activity/activityStreamService.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/activity", async (req, res) => {
  const { cohortId } = req.query;

  const events = await getActivityStream({
    viewerType: "ADMIN",
    cohortId: cohortId ? Number(cohortId) : null,
    limit: 100,
  });

  res.json(events);
});

export default router;
