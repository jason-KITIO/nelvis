/*
  Warnings:

  - A unique constraint covering the columns `[tokenAcces]` on the table `Devis` will be added. If there are existing duplicate values, this will fail.
  - The required column `tokenAcces` was added to the `Devis` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Devis" ADD COLUMN     "tokenAcces" TEXT NOT NULL,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Devis_tokenAcces_key" ON "Devis"("tokenAcces");
