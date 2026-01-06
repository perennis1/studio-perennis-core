import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken, requireAdmin } from "../../middleware/authMiddleware.js";
import { adminLogger } from "../../middleware/adminLogger.js";

const router = express.Router();

/**
 * Admin Activity = system-level observability
 * Actor: ADMIN
 * Source: adminAuditLog / eventLedger
 */

router.use(verifyToken, requireAdmin, adminLogger);

router.get("/", async (req, res) => {
  try {
    const activity = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        adminId: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
      },
    });

    res.json(activity);
  } catch (err) {
    console.error("ADMIN_ACTIVITY_ERROR", err);
    res.status(500).json({ error: "Failed to load admin activity" });
  }
});

export default router;
