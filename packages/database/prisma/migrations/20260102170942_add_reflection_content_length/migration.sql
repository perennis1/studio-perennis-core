/*
  Warnings:

  - A unique constraint covering the columns `[userId,lessonId]` on the table `Reflection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentLength` to the `Reflection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `Reflection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reflection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "timeline" JSONB;

-- AlterTable
ALTER TABLE "Reflection" ADD COLUMN     "contentLength" INTEGER NOT NULL,
ADD COLUMN     "lessonId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_userId_lessonId_key" ON "Reflection"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
