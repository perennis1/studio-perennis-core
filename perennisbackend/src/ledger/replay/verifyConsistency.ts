// src/replay/verifyConsistency.ts

import prisma from "../lib/prisma.js";
import { readLedger } from "./readLedger.js";
import { rebuildInventory } from "./rebuildInventory.js";
import { rebuildShipments } from "./rebuildShipments.js";

export async function verifyConsistency() {
  const events = await readLedger();

  /* ---------- INVENTORY CHECK ---------- */
  const inventorySnapshot = rebuildInventory(events);
  const dbInventory = await prisma.inventory.findMany();

  for (const row of dbInventory) {
    const snap = inventorySnapshot[row.variantId];

    if (!snap) {
      console.error("❌ Inventory missing in ledger", row.variantId);
      continue;
    }

    if (
      snap.onHand !== row.onHand ||
      snap.reserved !== row.reserved
    ) {
      console.error("❌ Inventory drift detected", {
        variantId: row.variantId,
        ledger: snap,
        db: {
          onHand: row.onHand,
          reserved: row.reserved,
        },
      });
    }
  }

  /* ---------- SHIPMENT CHECK ---------- */
  const shipmentSnapshot = rebuildShipments(events);
  const dbShipments = await prisma.shipment.findMany();

  for (const row of dbShipments) {
    const snap = shipmentSnapshot[row.id];

    if (!snap) {
      console.error("❌ Shipment missing in ledger", row.id);
      continue;
    }

    if (
      snap.status !== row.status ||
      snap.tracking !== row.tracking ||
      snap.carrier !== row.carrier
    ) {
      console.error("❌ Shipment drift detected", {
        shipmentId: row.id,
        ledger: snap,
        db: {
          status: row.status,
          carrier: row.carrier,
          tracking: row.tracking,
        },
      });
    }
  }

  console.log("✔ Consistency check completed");
}
