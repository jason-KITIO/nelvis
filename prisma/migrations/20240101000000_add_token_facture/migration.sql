-- Step 1: Add columns as optional
ALTER TABLE "Facture" ADD COLUMN "tokenAcces" TEXT;
ALTER TABLE "Facture" ADD COLUMN "tokenExpiresAt" TIMESTAMP;

-- Step 2: Populate existing rows with UUID
UPDATE "Facture" SET "tokenAcces" = gen_random_uuid()::text WHERE "tokenAcces" IS NULL;

-- Step 3: Add unique constraint
CREATE UNIQUE INDEX "Facture_tokenAcces_key" ON "Facture"("tokenAcces");
