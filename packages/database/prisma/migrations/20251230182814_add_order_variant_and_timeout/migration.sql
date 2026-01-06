/*
  Warnings:

  - Added the required column `paymentInitiatedAt` to the `BookOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `BookOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookOrder" ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "paymentInitiatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "BookOrderItem" ADD COLUMN     "variantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "BookOrder_paymentStatus_paymentInitiatedAt_idx" ON "BookOrder"("paymentStatus", "paymentInitiatedAt");

-- CreateIndex
CREATE INDEX "BookOrderItem_orderId_idx" ON "BookOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "BookOrderItem_variantId_idx" ON "BookOrderItem"("variantId");

-- AddForeignKey
ALTER TABLE "BookOrderItem" ADD CONSTRAINT "BookOrderItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookOrderItem" ADD CONSTRAINT "BookOrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "BookVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
