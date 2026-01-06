// perennisbackend/src/routes/adminLedgerHealRoutes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { replayLedgerState } from "../lib/ledgerReplay.js";

const router = express.Router();

router.post("/admin/ledger/heal", verifyToken, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }

  const dryRun = req.body?.dryRun !== false;

  try {
    const replay = await replayLedgerState(prisma);

    const fixes = {
      inventory: [],
      orders: [],
    };

    /* ---------------- INVENTORY ---------------- */
    const inventories = await prisma.inventory.findMany();

    for (const inv of inventories) {
      const expected = replay.inventory.get(inv.variantId);
      if (!expected) continue;

      if (
        inv.onHand !== expected.onHand ||
        inv.reserved !== expected.reserved
      ) {
        fixes.inventory.push({
          variantId: inv.variantId,
          from: { onHand: inv.onHand, reserved: inv.reserved },
          to: expected,
        });

        if (!dryRun) {
          await prisma.inventory.update({
            where: { id: inv.id },
            data: {
              onHand: expected.onHand,
              reserved: expected.reserved,
            },
          });
        }
      }
    }

    /* ---------------- ORDERS ---------------- */
    const orders = await prisma.bookOrder.findMany();

    for (const order of orders) {
      const expected = replay.orders.get(order.id);
      if (!expected) continue;

      if (order.status !== expected.status) {
        fixes.orders.push({
          orderId: order.id,
          from: order.status,
          to: expected.status,
        });

        if (!dryRun) {
          await prisma.bookOrder.update({
            where: { id: order.id },
            data: { status: expected.status },
          });
        }
      }
    }

    return res.json({
      mode: dryRun ? "DRY_RUN" : "APPLIED",
      summary: {
        inventoryFixes: fixes.inventory.length,
        orderFixes: fixes.orders.length,
      },
      fixes,
    });
  } catch (err) {
    console.error("Ledger auto-heal failed:", err);
    return res.status(500).json({ error: "Auto-heal failed" });
  }
});

export default router;
