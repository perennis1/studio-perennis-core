// src/replay/rebuildShipments.ts

import { LedgerEvent } from "./readLedger.js";

export type ShipmentState = {
  orderId: number;
  status: string;
  carrier?: string;
  tracking?: string;
};

export type ShipmentSnapshot = Record<string, ShipmentState>; 
// key = shipmentId

/**
 * Rebuild shipment state purely from ledger events.
 * Deterministic. Side-effect free.
 */
export function rebuildShipments(
  events: LedgerEvent[]
): ShipmentSnapshot {
  const snapshot: ShipmentSnapshot = {};

  for (const e of events) {
    if (e.entityType !== "SHIPMENT") continue;

    const shipmentId = e.entityId;

    if (!snapshot[shipmentId]) {
      snapshot[shipmentId] = {
        orderId: e.payload.orderId,
        status: "CREATED",
      };
    }

    const shipment = snapshot[shipmentId];

    switch (e.eventType) {
      case "CREATED":
        shipment.status = "CREATED";
        break;

      case "PACKED":
        shipment.status = "PACKED";
        break;

      case "SHIPPED":
        shipment.status = "SHIPPED";
        shipment.carrier = e.payload.carrier;
        shipment.tracking = e.payload.tracking;
        break;

      case "DELIVERED":
        shipment.status = "DELIVERED";
        break;

      case "RETURNED":
        shipment.status = "RETURNED";
        break;

      default:
        // Unknown shipment events intentionally ignored
        break;
    }
  }

  return snapshot;
}
