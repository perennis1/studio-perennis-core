-- CreateTable
CREATE TABLE "GateAssignment" (
    "id" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "cohortId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GateAssignment_gateId_cohortId_key" ON "GateAssignment"("gateId", "cohortId");

-- AddForeignKey
ALTER TABLE "GateAssignment" ADD CONSTRAINT "GateAssignment_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "ReflectionGate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
