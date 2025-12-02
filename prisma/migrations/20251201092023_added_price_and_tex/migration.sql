/*
  Warnings:

  - You are about to drop the column `price` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `texPercentage` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orderProducts" ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "texPercentage" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "price",
DROP COLUMN "texPercentage";
