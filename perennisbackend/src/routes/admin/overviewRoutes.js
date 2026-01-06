import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { toAdminOverviewDTO } from "../../dto/admin/AdminOverviewDTO.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/overview", async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      publishedPosts,
      draftsPending,
      commentsToday,
      newUsersThisWeek,
      viewsLast7Days,
    ] = await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED", deleted: false } }),
      prisma.post.count({ where: { status: "DRAFT", deleted: false } }),
      prisma.comment.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.activityEvent.count({
        where: {
          action: "READ_PAGE",
          entityType: "BOOK",
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    res.json(
      toAdminOverviewDTO({
        publishedPosts,
        draftsPending,
        commentsToday,
        newUsersThisWeek,
        viewsLast7Days,
      })
    );
  } catch (err) {
    next(err);
  }
});

export default router;
