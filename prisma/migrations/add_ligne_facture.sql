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

-- AddForeignKey
ALTER TABLE "LigneFacture" ADD CONSTRAINT "LigneFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
