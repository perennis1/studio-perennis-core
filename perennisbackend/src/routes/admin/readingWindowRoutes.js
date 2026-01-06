//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\readingWindowRoutes.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.post("/reading-windows", async (req, res) => {
  const { bookId, cohortId, startAt, endAt } = req.body;
  if (!bookId || !startAt || !endAt)
    return res.status(400).json({ error: "Invalid payload" });

  res.json(
    await prisma.readingWindow.create({
      data: {
        bookId,
        cohortId: cohortId ?? null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
      },
    })
  );
});

router.patch("/reading-windows/:id/close", async (req, res) => {
  res.json(
    await prisma.readingWindow.update({
      where: { id: req.params.id },
      data: { active: false },
    })
  );
});

export default router;
