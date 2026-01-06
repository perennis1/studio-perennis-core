//C:\Users\studi\my-next-app\perennisbackend\src\routes\adminRefundRoutes.js



import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { recordEvent } from "../lib/eventLedger.js";

const router = express.Router();

/**
 * POST /admin/refunds/book-order/:orderId
 *
 * Rules:
 * - Admin only
 * - Idempotent
 * - PDF refunds revoke LibraryEntry
 * - Hardcopy refunds DO NOT restock automatically (manual policy)
 */
router.post(
  "/book-order/:orderId",
  verifyToken,
  async (req, res) => {
    try {
      // 1. Admin guard
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      }

      const orderId = Number(req.params.orderId);
      if (!orderId) {
        return res.status(400).json({ error: "Invalid orderId" });
      }

      await prisma.$transaction(async (tx) => {
        const order = await tx.bookOrder.findUnique({
          where: { id: orderId },
          include: {
            items: true,
            payments: true,
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        // 2. Idempotency guard
        if (order.paymentStatus === "REFUNDED") {
          return;
        }

        if (order.paymentStatus !== "PAID") {
          throw new Error("Only PAID orders can be refunded");
        }

        // 3. Mark order as REFUNDED
        await tx.bookOrder.update({
          where: { id: order.id },
          data: { paymentStatus: "REFUNDED" },
        });

        // 4. Mark payments as REFUNDED
        await tx.payment.updateMany({
          where: { bookOrderId: order.id },
          data: { status: "REFUNDED" },
        });

        // 5. Revoke PDF access
        for (const item of order.items) {
          if (item.format === "PDF") {
            await tx.libraryEntry.deleteMany({
              where: {
                userId: order.userId,
                bookId: item.bookId,
                format: "PDF",
              },
            });

            await recordEvent(tx, {
              entityType: "LIBRARY",
              entityId: String(item.bookId),
              eventType: "REVOKED",
              actorType: "ADMIN",
              actorId: req.user.id,
              payload: {
                orderId: order.id,
                reason: "ADMIN_REFUND",
              },
            });
          }
        }

        // 6. Ledger events
        await recordEvent(tx, {
          entityType: "ORDER",
          entityId: String(order.id),
          eventType: "REFUNDED",
          actorType: "ADMIN",
          actorId: req.user.id,
        });
      });

      return res.json({ success: true });
    } catch (err) {
      console.error("ADMIN REFUND ERROR", err);
      return res.status(400).json({ error: err.message });
    }
  }
);

export default router;
