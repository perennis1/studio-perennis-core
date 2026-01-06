//C:\Users\studi\my-next-app\perennisbackend\src\routes\admin\refundRoutes.js

import express from "express";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

import { refundBookAccess } from "../../lib/refunds/refundService.js";

const router = express.Router();

router.use(verifyToken, requireAdmin, adminLogger);

router.post("/refunds/book", async (req, res) => {
  const { userId, bookId, paymentId, reason } = req.body;
  if (!userId || !bookId || !paymentId)
    return res.status(400).json({ error: "Invalid payload" });

  await refundBookAccess({
    adminId: req.user.id,
    userId,
    bookId,
    paymentId,
    reason,
  });

  res.json({ success: true });
});

export default router;
