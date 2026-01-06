//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\reflections.js

import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/reflections", async (_req, res) => {
  res.json({
    reflections: await prisma.reflectionAnswer.findMany({
      where: { flagged: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        gate: {
          select: {
            id: true,
            pageNumber: true,
            question: true,
            book: { select: { id: true, title: true } },
          },
        },
      },
    }),
  });
});

export default router;
