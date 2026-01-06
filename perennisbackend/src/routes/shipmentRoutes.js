import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { recordEvent } from "../lib/eventLedger.js";

const router = express.Router();

/**
 * POST /api/shipments/:orderId/pack
 */
router.post("/:orderId/pack", verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.bookOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { variant: true } } },
    });

    if (!order || order.status !== "PAID") {
      return res.status(400).json({ error: "Order not packable" });
    }

    const hasHardcopy = order.items.some(i => i.variant.type === "HARDCOPY");
    if (!hasHardcopy) {
      return res.status(400).json({ error: "No shippable items" });
    }

    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        status: "PACKED",
      },
    });

    await recordEvent(prisma, {
      entityType: "SHIPMENT",
      entityId: shipment.id,
      eventType: "PACKED",
      actorType: "ADMIN",
      payload: { orderId },
    });

    res.json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Pack failed" });
  }
});

/**
 * POST /api/shipments/:orderId/ship
 */
router.post("/:orderId/ship", verifyToken, async (req, res) => {
  const { orderId } = req.params;
  const { courier, trackingCode } = req.body;

  try {
    const shipment = await prisma.shipment.update({
      where: { orderId },
      data: {
        status: "SHIPPED",
        courier,
        trackingCode,
        shippedAt: new Date(),
      },
    });

    await recordEvent(prisma, {
      entityType: "SHIPMENT",
      entityId: shipment.id,
      eventType: "SHIPPED",
      actorType: "ADMIN",
      payload: { courier, trackingCode },
    });

    res.json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ship failed" });
  }
});

/**
 * POST /api/shipments/:orderId/deliver
 */
router.post("/:orderId/deliver", verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const shipment = await prisma.shipment.update({
      where: { orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    await recordEvent(prisma, {
      entityType: "SHIPMENT",
      entityId: shipment.id,
      eventType: "DELIVERED",
      actorType: "SYSTEM",
      payload: {},
    });

    res.json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delivery update failed" });
  }
});

export default router;
