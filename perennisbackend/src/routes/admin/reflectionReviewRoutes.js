//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\reflectionReviewRoutes.js
import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/reflections/flagged", async (_req, res) => {
  res.json(
    await prisma.reflectionAnswer.findMany({
      where: { flagged: true },
      orderBy: { id: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        gate: { select: { id: true, question: true } },
      },
    })
  );
});

export default router;
