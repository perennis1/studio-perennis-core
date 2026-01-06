-- CreateTable
CREATE TABLE "EventLedger" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventLedger_entityType_entityId_idx" ON "EventLedger"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EventLedger_eventType_idx" ON "EventLedger"("eventType");
