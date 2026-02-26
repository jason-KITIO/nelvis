-- Supprimer les contraintes de clés étrangères problématiques
ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_devisId_fkey";
ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_factureId_fkey";
