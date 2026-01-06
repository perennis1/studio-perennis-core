-- CreateEnum
CREATE TYPE "ReflectionQuality" AS ENUM ('OK', 'LOW_EFFORT', 'REPETITIVE');

-- AlterTable
ALTER TABLE "ReflectionAnswer" ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inquiryThreadId" TEXT,
ADD COLUMN     "quality" "ReflectionQuality" NOT NULL DEFAULT 'OK';

-- CreateTable
CREATE TABLE "InquiryThread" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InquiryThread_userId_open_idx" ON "InquiryThread"("userId", "open");

-- AddForeignKey
ALTER TABLE "ReflectionAnswer" ADD CONSTRAINT "ReflectionAnswer_inquiryThreadId_fkey" FOREIGN KEY ("inquiryThreadId") REFERENCES "InquiryThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryThread" ADD CONSTRAINT "InquiryThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
