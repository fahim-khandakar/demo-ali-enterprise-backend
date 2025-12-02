/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `userDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "userDetails" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "userDetails_email_key" ON "userDetails"("email");
