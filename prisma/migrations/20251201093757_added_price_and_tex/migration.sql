/*
  Warnings:

  - You are about to alter the column `price` on the `orderProducts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `texPercentage` on the `orderProducts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "orderProducts" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "texPercentage" SET DATA TYPE DECIMAL(5,2);
