// src/jobs/releaseStaleOrders.js
import prisma from "../lib/prisma.js";
import { recordEvent } from "../lib/eventLedger.js";

const TIMEOUT_MINUTES = 15;

export async function releaseStaleOrders() {
  const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    const staleOrders = await tx.bookOrder.findMany({
      where: {
        paymentStatus: "PENDING",
        paymentInitiatedAt: { lt: cutoff },
        expiredAt: null,
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    for (const order of staleOrders) {
      for (const item of order.items) {
        if (item.variant.type !== "HARDCOPY") continue;

        const updated = await tx.inventory.updateMany({
          where: {
            variantId: item.variantId,
            reserved: { gte: item.quantity },
          },
          data: {
            reserved: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new Error(
            `Inventory invariant broken for variant ${item.variantId}`
          );
        }

        await recordEvent(tx, {
          entityType: "INVENTORY",
          entityId: item.variantId,
          eventType: "RELEASED",
          actorType: "SYSTEM",
          payload: {
            orderId: order.id,
            qty: item.quantity,
            reason: "PAYMENT_TIMEOUT",
          },
        });
      }

      await tx.bookOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "EXPIRED",
          expiredAt: new Date(),
        },
      });

      await recordEvent(tx, {
        entityType: "ORDER",
        entityId: String(order.id),
        eventType: "EXPIRED",
        actorType: "SYSTEM",
        payload: {
          reason: "PAYMENT_TIMEOUT",
        },
      });
    }
  });

  console.log("✔ stale orders released safely");
}
