/*
  Warnings:

  - You are about to drop the column `description` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryNotes` on the `BookOrder` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `BookOrder` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `BookOrder` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `BookOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `gifUrl` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `likeCount` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `pinned` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `durationMin` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `enrolledAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `bookmarksCount` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `isPreview` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `likesCount` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `mcqs` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `transcript` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LessonBookmark` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LessonLike` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `coverImageUrl` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PostReaction` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `UserActivity` table. All the data in the column will be lost.
  - You are about to drop the `LessonEnrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReadingProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SiteSetting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,bookId]` on the table `LibraryEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `totalAmountPaise` to the `BookOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPricePaise` to the `BookOrderItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `format` on the `BookOrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `format` on the `LibraryEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VariantType" AS ENUM ('PDF', 'HARDCOPY');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('IN_HOUSE', 'POD', 'HYBRID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COD_PENDING', 'COD_PAID');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'PACKED', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ReadingMode" AS ENUM ('FREE', 'GUIDED', 'INQUIRY');

-- CreateEnum
CREATE TYPE "ReadingSessionState" AS ENUM ('ACTIVE', 'GATE_BLOCKED', 'COMPLETED', 'ABANDONED', 'LOCKED');

-- DropForeignKey
ALTER TABLE "BookOrder" DROP CONSTRAINT "BookOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "BookOrderItem" DROP CONSTRAINT "BookOrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LessonEnrollment" DROP CONSTRAINT "LessonEnrollment_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonEnrollment" DROP CONSTRAINT "LessonEnrollment_userId_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryEntry" DROP CONSTRAINT "LibraryEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserActivity" DROP CONSTRAINT "UserActivity_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "UserActivity" DROP CONSTRAINT "UserActivity_userId_fkey";

-- DropIndex
DROP INDEX "Lesson_slug_key";

-- DropIndex
DROP INDEX "LibraryEntry_userId_idx";

-- DropIndex
DROP INDEX "Purchase_stripeSessionId_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "description",
ADD COLUMN     "pages" INTEGER;

-- AlterTable
ALTER TABLE "BookOrder" DROP COLUMN "deliveryNotes",
DROP COLUMN "status",
DROP COLUMN "totalAmount",
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalAmountPaise" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BookOrderItem" DROP COLUMN "unitPrice",
ADD COLUMN     "unitPricePaise" INTEGER NOT NULL,
DROP COLUMN "format",
ADD COLUMN     "format" "VariantType" NOT NULL;

-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "gifUrl",
DROP COLUMN "likeCount",
DROP COLUMN "pinned",
DROP COLUMN "status",
DROP COLUMN "targetType";

-- AlterTable
ALTER TABLE "CommentReaction" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "authorId",
DROP COLUMN "createdAt",
DROP COLUMN "durationMin",
DROP COLUMN "level",
DROP COLUMN "summary",
DROP COLUMN "thumbnail",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "enrolledAt",
DROP COLUMN "progress",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "body",
DROP COLUMN "bookmarksCount",
DROP COLUMN "createdAt",
DROP COLUMN "isPreview",
DROP COLUMN "likesCount",
DROP COLUMN "mcqs",
DROP COLUMN "slug",
DROP COLUMN "summary",
DROP COLUMN "transcript",
DROP COLUMN "updatedAt",
DROP COLUMN "videoUrl";

-- AlterTable
ALTER TABLE "LessonBookmark" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "LessonLike" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "LibraryEntry" DROP COLUMN "format",
ADD COLUMN     "format" "VariantType" NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category",
DROP COLUMN "coverImageUrl",
DROP COLUMN "deleted",
DROP COLUMN "deletedAt",
DROP COLUMN "publishedAt",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "PostReaction" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "stripeSessionId";

-- AlterTable
ALTER TABLE "UserActivity" DROP COLUMN "lessonId";

-- DropTable
DROP TABLE "LessonEnrollment";

-- DropTable
DROP TABLE "ReadingProgress";

-- DropTable
DROP TABLE "SiteSetting";

-- DropEnum
DROP TYPE "BookOrderStatus";

-- CreateTable
CREATE TABLE "BookVariant" (
    "id" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "type" "VariantType" NOT NULL,
    "sku" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'IN_HOUSE',

    CONSTRAINT "BookVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT DEFAULT 'IN',

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookOrderId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookOrderTransition" (
    "id" TEXT NOT NULL,
    "bookOrderId" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "fromValue" TEXT NOT NULL,
    "toValue" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookOrderTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "mode" "ReadingMode" NOT NULL,
    "state" "ReadingSessionState" NOT NULL DEFAULT 'ACTIVE',
    "lastSeenPage" INTEGER,
    "furthestAllowedPage" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookSegment" (
    "id" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "startPage" INTEGER,
    "endPage" INTEGER,

    CONSTRAINT "BookSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReflectionGate" (
    "id" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "minLength" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "ReflectionGate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReflectionAnswer" (
    "id" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ReflectionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnEntry" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "unresolvedNote" TEXT,
    "revisitAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookVariant_sku_key" ON "BookVariant"("sku");

-- CreateIndex
CREATE INDEX "BookVariant_bookId_idx" ON "BookVariant"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_variantId_warehouseId_key" ON "Inventory"("variantId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_providerRef_key" ON "Payment"("provider", "providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "BookOrderTransition_idempotencyKey_key" ON "BookOrderTransition"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ReadingSession_userId_bookId_idx" ON "ReadingSession"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookSegment_bookId_order_key" ON "BookSegment"("bookId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ReflectionAnswer_gateId_userId_key" ON "ReflectionAnswer"("gateId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnEntry_userId_bookId_key" ON "ReturnEntry"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryEntry_userId_bookId_key" ON "LibraryEntry"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookVariant" ADD CONSTRAINT "BookVariant_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "BookVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryEntry" ADD CONSTRAINT "LibraryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryEntry" ADD CONSTRAINT "LibraryEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookOrder" ADD CONSTRAINT "BookOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookOrderItem" ADD CONSTRAINT "BookOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BookOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookOrderId_fkey" FOREIGN KEY ("bookOrderId") REFERENCES "BookOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookOrderTransition" ADD CONSTRAINT "BookOrderTransition_bookOrderId_fkey" FOREIGN KEY ("bookOrderId") REFERENCES "BookOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSegment" ADD CONSTRAINT "BookSegment_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReflectionGate" ADD CONSTRAINT "ReflectionGate_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReflectionAnswer" ADD CONSTRAINT "ReflectionAnswer_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "ReflectionGate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReflectionAnswer" ADD CONSTRAINT "ReflectionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnEntry" ADD CONSTRAINT "ReturnEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnEntry" ADD CONSTRAINT "ReturnEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
