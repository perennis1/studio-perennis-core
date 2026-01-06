// perennisbackend/src/routes/checkoutRoutes.js

import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { recordEvent } from "../lib/eventLedger.js";
import { getRazorpay } from "../lib/razorpayClient.js";

const router = express.Router();

/**
 * POST /api/checkout/initiate
 */
router.post("/initiate", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items" });
  }

  const razorpay = getRazorpay();
  if (!razorpay) {
    return res.status(503).json({
      error: "Payments are disabled in this environment",
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let totalPaise = 0;

      for (const item of items) {
        if (!item.variantId || item.qty <= 0) {
          throw new Error("Invalid cart item");
        }

        const variant = await tx.bookVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant) throw new Error("Invalid variant");

        totalPaise += variant.pricePaise * item.qty;

        // 🔒 HARDCOPY → INVENTORY RESERVATION
        if (variant.type === "HARDCOPY") {
          const inventory = await tx.inventory.findFirst({
            where: { variantId: variant.id },
            lock: { mode: "for update" },
          });

          if (!inventory) throw new Error("Inventory not found");

          const available = inventory.onHand - inventory.reserved;
          if (available < item.qty) throw new Error("Out of stock");

          await tx.inventory.update({
            where: { id: inventory.id },
            data: { reserved: { increment: item.qty } },
          });

          await recordEvent(tx, {
            entityType: "INVENTORY",
            entityId: inventory.id,
            eventType: "RESERVED",
            actorType: "USER",
            actorId: userId,
            payload: {
              variantId: variant.id,
              qty: item.qty,
            },
          });
        }
      }

      // 💳 Razorpay order (safe now)
      const rpOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      const order = await tx.bookOrder.create({
        data: {
          userId,
          razorpayOrderId: rpOrder.id,
          amountPaise: totalPaise,
          status: "PENDING",
        },
      });

      await recordEvent(tx, {
        entityType: "ORDER",
        entityId: order.id,
        eventType: "CREATED",
        actorType: "USER",
        actorId: userId,
        payload: {
          razorpayOrderId: rpOrder.id,
          amountPaise: totalPaise,
        },
      });

      return {
        razorpayOrder: rpOrder,
        orderId: order.id,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error("Checkout initiate error:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

export default router;
