//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\inquiryReviewRoutes.js
import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";


const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/inquiries/open", async (_req, res) => {
  res.json(
    await prisma.inquiryThread.findMany({
      where: { open: true },
      include: { user: { select: { id: true, name: true } } },
    })
  );
});

export default router;
