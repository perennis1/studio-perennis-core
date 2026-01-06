-- CreateTable
CREATE TABLE "CurriculumSignal" (
    "id" SERIAL NOT NULL,
    "curriculumType" TEXT NOT NULL,
    "curriculumId" INTEGER NOT NULL,
    "nodeIndex" INTEGER NOT NULL,
    "avgEngagement" DOUBLE PRECISION,
    "avgReflectionLen" DOUBLE PRECISION,
    "frictionRate" DOUBLE PRECISION,
    "completionRate" DOUBLE PRECISION,
    "sampleSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurriculumSignal_curriculumType_curriculumId_idx" ON "CurriculumSignal"("curriculumType", "curriculumId");
