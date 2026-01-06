// src/routes/analyticsRoutes.js
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET /admin/analytics/summary
router.get("/admin/analytics/summary", async (req, res) => {
  try {
    const [posts, comments, users] = await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.user.count(),
    ]);

    // TODO: replace with real 7-day views later
    const viewsLast7Days = 0;

    res.json({
      viewsLast7Days,
      totalUsers: users,
      publishedPosts: posts,
      totalComments: comments,
    });
  } catch (err) {
    console.error("analytics summary error:", err);
    res.status(500).json({ message: "Analytics summary failed" });
  }
});

export default router;
