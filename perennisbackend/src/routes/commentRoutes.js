//src\routes\commentRoutes.js


import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/comments", async (req, res) => {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId)
    return res.status(400).json({ message: "Missing target type or id" });

  try {
    const comments = await prisma.comment.findMany({
      where: {
        targetType: String(targetType),
        targetId: Number(targetId),
        parentId: null,
        status: "visible",
      },
      include: { user: true, replies: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load comments" });
  }
});

router.post("/comments", verifyToken, async (req, res) => {
  const { targetType, targetId, parentId, content } = req.body;

  if (!targetType || !targetId || !content)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const comment = await prisma.comment.create({
      data: {
        userId: req.user.id,
        targetType,
        targetId,
        parentId: parentId || null,
        content,
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Failed to post comment" });
  }
});

export default router;
