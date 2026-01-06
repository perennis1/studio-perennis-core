-- CreateTable
CREATE TABLE "ReadingWindow" (
    "id" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "cohortId" INTEGER,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReadingWindow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingWindow_bookId_cohortId_idx" ON "ReadingWindow"("bookId", "cohortId");

-- AddForeignKey
ALTER TABLE "ReadingWindow" ADD CONSTRAINT "ReadingWindow_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
