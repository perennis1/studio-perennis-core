import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { replayLedgerToState } from "../services/ledgerReplay.js";

const router = express.Router();

/**
 * GET /api/admin/ledger/verify
 *
 * Optional query:
 * - entityType=INVENTORY | ORDER
 * - entityId
 */
router.get("/ledger/verify", verifyToken, async (req, res) => {
  try {
    // 🔐 Admin only
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin only" });
    }

    const { entityType, entityId } = req.query;

    // 1️⃣ Load ledger events
    const ledgerEvents = await prisma.eventLedger.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      },
      orderBy: { createdAt: "asc" },
    });

    // 2️⃣ Rebuild expected state from ledger (PURE)
    const expectedState = replayLedgerToState(ledgerEvents);

    // 3️⃣ Load actual DB state
    const actualInventory = await prisma.inventory.findMany();
    const actualOrders = await prisma.bookOrder.findMany();

    // 4️⃣ Compute diffs
    const inventoryDiffs = [];
    for (const expected of expectedState.inventory.values()) {
      const actual = actualInventory.find(
        (i) => i.variantId === expected.variantId
      );

      if (!actual) {
        inventoryDiffs.push({
          type: "MISSING_ROW",
          expected,
        });
        continue;
      }

      if (
        actual.onHand !== expected.onHand ||
        actual.reserved !== expected.reserved
      ) {
        inventoryDiffs.push({
          type: "MISMATCH",
          variantId: expected.variantId,
          expected,
          actual: {
            onHand: actual.onHand,
            reserved: actual.reserved,
          },
        });
      }
    }

    const orderDiffs = [];
    for (const expected of expectedState.orders.values()) {
      const actual = actualOrders.find((o) => o.id === expected.id);

      if (!actual) {
        orderDiffs.push({
          type: "MISSING_ORDER",
          expected,
        });
        continue;
      }

      if (actual.status !== expected.status) {
        orderDiffs.push({
          type: "STATUS_MISMATCH",
          orderId: expected.id,
          expected: expected.status,
          actual: actual.status,
        });
      }
    }

    res.json({
      ok: inventoryDiffs.length === 0 && orderDiffs.length === 0,
      inventoryDiffs,
      orderDiffs,
    });
  } catch (err) {
    console.error("Ledger verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
