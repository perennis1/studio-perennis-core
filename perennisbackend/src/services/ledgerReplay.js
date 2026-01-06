/**
 * Ledger Replay Engine
 * --------------------
 * PURE FUNCTION
 * Input  : ordered ledger events
 * Output : reconstructed state
 *
 * No DB calls
 * No mutations
 * No side effects
 */

export function replayLedgerToState(events) {
  /**
   * State shape
   */
  const state = {
    inventory: new Map(), // key: variantId
    orders: new Map(),    // key: orderId
  };

  for (const evt of events) {
    const { entityType, entityId, eventType, payload } = evt;

    /* ---------------- INVENTORY ---------------- */
    if (entityType === "INVENTORY") {
      const variantId = entityId;

      if (!state.inventory.has(variantId)) {
        state.inventory.set(variantId, {
          variantId,
          onHand: 0,
          reserved: 0,
        });
      }

      const inv = state.inventory.get(variantId);

      switch (eventType) {
        case "RESERVED":
          inv.reserved += payload.qty;
          break;

        case "RELEASED":
          inv.reserved -= payload.qty;
          break;

        case "COMMITTED":
          inv.reserved -= payload.qty;
          inv.onHand -= payload.qty;
          break;

        case "STOCK_ADDED":
          inv.onHand += payload.qty;
          break;

        default:
          // Unknown inventory event → ignore (forward compatible)
          break;
      }
    }

    /* ---------------- ORDERS ---------------- */
    if (entityType === "ORDER") {
      const orderId = Number(entityId);

      if (!state.orders.has(orderId)) {
        state.orders.set(orderId, {
          id: orderId,
          status: "PENDING",
        });
      }

      const order = state.orders.get(orderId);

      switch (eventType) {
        case "CREATED":
          order.status = "PENDING";
          break;

        case "PAID":
          order.status = "PAID";
          break;

        case "FAILED":
          order.status = "FAILED";
          break;

        case "EXPIRED":
          order.status = "EXPIRED";
          break;

        default:
          // Ignore unknown order events
          break;
      }
    }
  }

  return state;
}
