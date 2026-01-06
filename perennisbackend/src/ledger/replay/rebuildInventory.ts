// src/replay/rebuildInventory.ts

import { LedgerEvent } from "./readLedger.js";

export type InventoryState = {
  onHand: number;
  reserved: number;
};

export type InventorySnapshot = Record<string, InventoryState>; 
// key = variantId

/**
 * Rebuild inventory state purely from ledger events.
 * This function must remain deterministic and side-effect free.
 */
export function rebuildInventory(events: LedgerEvent[]): InventorySnapshot {
  const snapshot: InventorySnapshot = {};

  for (const e of events) {
    if (e.entityType !== "INVENTORY") continue;

    const variantId = e.entityId;

    if (!snapshot[variantId]) {
      snapshot[variantId] = { onHand: 0, reserved: 0 };
    }

    const state = snapshot[variantId];

    switch (e.eventType) {
      case "SEED":
        state.onHand += e.payload.qty;
        break;

      case "RESERVED":
        state.reserved += e.payload.qty;
        break;

      case "RELEASED":
        state.reserved -= e.payload.qty;
        break;

      case "COMMITTED":
        state.reserved -= e.payload.qty;
        state.onHand -= e.payload.qty;
        break;

      default:
        // Ignore unknown inventory events intentionally
        break;
    }

    // Hard invariants (never allow drift)
    if (state.onHand < 0 || state.reserved < 0) {
      throw new Error(
        `Inventory invariant violated for variant ${variantId}`
      );
    }
  }

  return snapshot;
}
