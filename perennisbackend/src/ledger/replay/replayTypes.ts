// src/replay/replayTypes.ts

export type ReplayWindow = {
  from?: Date;
  to?: Date;
};

export type ReplayMode = "DRY_RUN" | "APPLY";

export type ReplayViolation = {
  entityType: "ORDER" | "INVENTORY" | "SHIPMENT";
  entityId: string | number;
  reason: string;
  firstSeenAt: Date;
};

export type ReplayResult = {
  ok: boolean;
  replayed: {
    orders: number;
    inventoryEvents: number;
    shipments: number;
  };
  violations: ReplayViolation[];
};

export type ReplayContext = {
  window?: ReplayWindow;
  mode: ReplayMode;
};
