-- CreateTable
CREATE TABLE "LessonEngagementSignal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "watchRatio" DOUBLE PRECISION,
    "completionConfidence" DOUBLE PRECISION,
    "rewatchIntensity" DOUBLE PRECISION,
    "timelineUsageRate" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonEngagementSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookReadingSignal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "totalSessions" INTEGER NOT NULL,
    "totalPagesRead" INTEGER NOT NULL,
    "avgSessionDepth" DOUBLE PRECISION,
    "returnFrequency" DOUBLE PRECISION,
    "gateFriction" DOUBLE PRECISION,
    "reflectionDensity" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookReadingSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonEngagementSignal_userId_lessonId_key" ON "LessonEngagementSignal"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "BookReadingSignal_userId_bookId_key" ON "BookReadingSignal"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "BookReadingSignal" ADD CONSTRAINT "BookReadingSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReadingSignal" ADD CONSTRAINT "BookReadingSignal_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
