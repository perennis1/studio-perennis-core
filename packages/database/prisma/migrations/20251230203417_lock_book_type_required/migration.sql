/*
  Warnings:

  - Made the column `type` on table `Book` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "type" SET NOT NULL;
