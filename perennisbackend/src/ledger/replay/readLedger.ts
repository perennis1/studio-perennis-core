// src/replay/readLedger.ts

import prisma from "../lib/prisma.js";
import { ReplayContext } from "./replayTypes.js";

export type LedgerEvent = {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  payload: any;
  createdAt: Date;
};

export async function readLedger(ctx: ReplayContext): Promise<LedgerEvent[]> {
  const { window } = ctx;

  return prisma.eventLedger.findMany({
    where: {
      ...(window?.from || window?.to
        ? {
            createdAt: {
              ...(window.from ? { gte: window.from } : {}),
              ...(window.to ? { lte: window.to } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "asc" }, // CRITICAL: deterministic replay
  });
}
