-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('CURRICULUM', 'GENERAL');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "type" "BookType";
