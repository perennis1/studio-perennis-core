import prisma from "./prisma.js";

export async function replayLedger({ from = null } = {}) {
  return prisma.$transaction(async (tx) => {
    // 1. Reset derived state
    await tx.inventory.updateMany({
      data: { onHand: 0, reserved: 0 },
    });

    await tx.shipment.deleteMany({});
    await tx.bookOrderTransition.deleteMany({});

    // 2. Fetch events in order
    const events = await tx.eventLedger.findMany({
      where: from ? { createdAt: { gte: from } } : {},
      orderBy: { createdAt: "asc" },
    });

    // 3. Apply events
    for (const e of events) {
      switch (e.entityType) {
        case "INVENTORY":
          await applyInventoryEvent(tx, e);
          break;
        case "ORDER":
          await applyOrderEvent(tx, e);
          break;
        case "SHIPMENT":
          await applyShipmentEvent(tx, e);
          break;
      }
    }

    return { applied: events.length };
  });
}
