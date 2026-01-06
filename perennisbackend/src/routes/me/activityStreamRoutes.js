import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { getActivityStream } from "../../lib/activity/activityStreamService.js";

const router = express.Router();

/**
 * GET /me/activity
 */
router.get("/me/activity", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const events = await getActivityStream({
    viewerType: "USER",
    viewerUserId: userId,
    limit: 50,
  });

  res.json(events);
});

export default router;
