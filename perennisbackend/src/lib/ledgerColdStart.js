// perennisbackend/src/lib/ledgerColdStart.js
export async function coldStartRebuild(prisma) {
  const events = await prisma.eventLedger.findMany({
    orderBy: { createdAt: "asc" },
  });

  const inventory = new Map();
  const orders = new Map();
  const shipments = new Map();

  for (const e of events) {
    /* -------- INVENTORY -------- */
    if (e.entityType === "INVENTORY") {
      const s = inventory.get(e.entityId) || { onHand: 0, reserved: 0 };

      if (e.eventType === "RESERVED") s.reserved += e.payload.qty;
      if (e.eventType === "RELEASED") s.reserved -= e.payload.qty;
      if (e.eventType === "COMMITTED") {
        s.reserved -= e.payload.qty;
        s.onHand -= e.payload.qty;
      }
      if (e.eventType === "ADJUSTED") {
        s.onHand = e.payload.onHand;
        s.reserved = e.payload.reserved;
      }

      inventory.set(e.entityId, s);
    }

    /* -------- ORDERS -------- */
    if (e.entityType === "ORDER") {
      orders.set(e.entityId, { status: e.eventType });
    }

    /* -------- SHIPMENTS -------- */
    if (e.entityType === "SHIPMENT") {
      shipments.set(e.entityId, {
        orderId: e.payload.orderId,
        status: e.eventType,
        addressSnapshot: e.payload.addressSnapshot,
      });
    }
  }

  /* -------- WRITE DB -------- */
  await prisma.$transaction(async (tx) => {
    // Inventory
    for (const [variantId, s] of inventory) {
      await tx.inventory.upsert({
        where: { variantId },
        update: { onHand: s.onHand, reserved: s.reserved },
        create: {
          variantId,
          onHand: s.onHand,
          reserved: s.reserved,
        },
      });
    }

    // Orders
    for (const [orderId, s] of orders) {
      await tx.bookOrder.updateMany({
        where: { id: orderId },
        data: { status: s.status },
      });
    }

    // Shipments
    for (const [shipmentId, s] of shipments) {
      await tx.shipment.upsert({
        where: { id: shipmentId },
        update: { status: s.status },
        create: {
          id: shipmentId,
          orderId: s.orderId,
          status: s.status,
          addressSnapshot: s.addressSnapshot,
        },
      });
    }
  });
}
