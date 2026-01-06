import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/admin/ledger
 *
 * Query params (all optional):
 * - entityType
 * - entityId
 * - eventType
 * - from (ISO date)
 * - to   (ISO date)
 * - limit (default 50, max 200)
 * - cursor (event id for pagination)
 */
router.get("/ledger", verifyToken, async (req, res) => {
  try {
    // 🔐 Admin only
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin only" });
    }

    const {
      entityType,
      entityId,
      eventType,
      from,
      to,
      limit = 50,
      cursor,
    } = req.query;

    const where = {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(eventType && { eventType }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    };

    const take = Math.min(Number(limit) || 50, 200);

    const events = await prisma.eventLedger.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: take + 1, // fetch extra to detect next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    let nextCursor = null;
    if (events.length > take) {
      const next = events.pop();
      nextCursor = next.id;
    }

    res.json({
      events,
      nextCursor,
    });
  } catch (err) {
    console.error("Admin ledger read error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
