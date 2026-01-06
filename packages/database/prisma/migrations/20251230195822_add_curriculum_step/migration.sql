-- CreateTable
CREATE TABLE "CurriculumStep" (
    "id" TEXT NOT NULL,
    "cohortId" INTEGER,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumStep_cohortId_order_key" ON "CurriculumStep"("cohortId", "order");
