/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClientStatut" AS ENUM ('PROSPECT', 'PROPOSE', 'NEGOCIE', 'GAGNE', 'PERDU');

-- DropForeignKey
ALTER TABLE "LigneDocument" DROP CONSTRAINT "LigneDocument_produitId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "statut" "ClientStatut" DEFAULT 'PROSPECT';

-- AlterTable
ALTER TABLE "NoteDeFrais" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marchandOcr" TEXT,
ADD COLUMN     "tvaOcr" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "LigneDevis" (
    "id" TEXT NOT NULL,
    "devisId" TEXT NOT NULL,
    "produitId" TEXT,
    "description" TEXT NOT NULL,
    "quantite" DECIMAL(65,30) NOT NULL,
    "prixUnitaireHt" DECIMAL(65,30) NOT NULL,
    "tauxTva" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LigneDevis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneFacture" (
    "id" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "produitId" TEXT,
    "description" TEXT NOT NULL,
    "quantite" DECIMAL(65,30) NOT NULL,
    "prixUnitaireHt" DECIMAL(65,30) NOT NULL,
    "tauxTva" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LigneFacture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "titre" TEXT NOT NULL DEFAULT 'Nouvelle conversation',
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatConversation_organisationId_idx" ON "ChatConversation"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "NoteDeFrais_organisationId_idx" ON "NoteDeFrais"("organisationId");

-- AddForeignKey
ALTER TABLE "LigneDevis" ADD CONSTRAINT "LigneDevis_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneFacture" ADD CONSTRAINT "LigneFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
