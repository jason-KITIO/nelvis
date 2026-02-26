-- CreateEnum
CREATE TYPE "OrgMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('ACTE', 'ABONNEMENT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIF', 'EXPIRE');

-- CreateEnum
CREATE TYPE "DossierStatut" AS ENUM ('DRAFT', 'SOUMIS', 'VALIDE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('STATUTS', 'M0', 'PV', 'ANNONCE');

-- CreateEnum
CREATE TYPE "TypeAG" AS ENUM ('AGO', 'AGE');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('B2B', 'B2C');

-- CreateEnum
CREATE TYPE "ProduitType" AS ENUM ('PRODUIT', 'SERVICE');

-- CreateEnum
CREATE TYPE "DevisStatut" AS ENUM ('DRAFT', 'ENVOYE', 'ACCEPTE', 'REFUSE');

-- CreateEnum
CREATE TYPE "FactureStatut" AS ENUM ('EMISE', 'PAYEE', 'IMPAYEE', 'AVOIR');

-- CreateEnum
CREATE TYPE "DocumentFactType" AS ENUM ('DEVIS', 'FACTURE');

-- CreateEnum
CREATE TYPE "OpportuniteEtape" AS ENUM ('PROSPECT', 'PROPOSE', 'NEGOCIE', 'GAGNE', 'PERDU');

-- CreateEnum
CREATE TYPE "NoteFraisStatut" AS ENUM ('EN_ATTENTE', 'VALIDE');

-- CreateEnum
CREATE TYPE "StatutMatching" AS ENUM ('NON_MATCHE', 'MATCHE', 'PARTIEL');

-- CreateEnum
CREATE TYPE "EmployeStatut" AS ENUM ('ACTIF', 'SORTI');

-- CreateEnum
CREATE TYPE "ContratType" AS ENUM ('CDI', 'CDD', 'STAGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siret" TEXT,
    "siren" TEXT,
    "formeJuridique" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "logoUrl" TEXT,
    "charteGraphique" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "role" "OrgMemberRole" NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserModule" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "juridique" BOOLEAN NOT NULL DEFAULT false,
    "facturation" BOOLEAN NOT NULL DEFAULT false,
    "comptabilite" BOOLEAN NOT NULL DEFAULT false,
    "rhPaie" BOOLEAN NOT NULL DEFAULT false,
    "vocal" BOOLEAN NOT NULL DEFAULT false,
    "logistique" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "statut" "SubscriptionStatus" NOT NULL,
    "stripeSubId" TEXT,
    "paypalSubId" TEXT,
    "debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organisationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "iaAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierJuridique" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "statut" "DossierStatut" NOT NULL,
    "formeJuridique" TEXT NOT NULL,
    "questionnaire" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DossierJuridique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentJuridique" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "contenu" TEXT NOT NULL,
    "fichierUrl" TEXT NOT NULL,
    "supprimeLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentJuridique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesVerbal" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "typeAG" "TypeAG" NOT NULL,
    "dateAG" TIMESTAMP(3) NOT NULL,
    "decisions" JSONB NOT NULL,
    "documentUrl" TEXT NOT NULL,

    CONSTRAINT "ProcesVerbal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "siret" TEXT,
    "adresse" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "ProduitType" NOT NULL,
    "prixHt" DECIMAL(65,30) NOT NULL,
    "tauxTva" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devis" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "statut" "DevisStatut" NOT NULL,
    "montantHt" DECIMAL(65,30) NOT NULL,
    "tva" DECIMAL(65,30) NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "devisId" TEXT,
    "numero" TEXT NOT NULL,
    "statut" "FactureStatut" NOT NULL,
    "montantHt" DECIMAL(65,30) NOT NULL,
    "tvaMontant" DECIMAL(65,30) NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "stripePaymentIntent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneDocument" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" "DocumentFactType" NOT NULL,
    "produitId" TEXT,
    "description" TEXT NOT NULL,
    "quantite" DECIMAL(65,30) NOT NULL,
    "prixUnitaireHt" DECIMAL(65,30) NOT NULL,
    "tauxTva" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LigneDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportuniteCRM" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "etape" "OpportuniteEtape" NOT NULL,
    "valeurEstimee" DECIMAL(65,30) NOT NULL,
    "dateClosing" TIMESTAMP(3),

    CONSTRAINT "OpportuniteCRM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteDeFrais" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "montantOcr" DECIMAL(65,30),
    "dateOcr" TIMESTAMP(3),
    "categorieOcr" TEXT,
    "statut" "NoteFraisStatut" NOT NULL,

    CONSTRAINT "NoteDeFrais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteBancaire" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "soldeActuel" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "CompteBancaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionBancaire" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "libelle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "statutMatching" "StatutMatching" NOT NULL,
    "factureId" TEXT,
    "scoreMatching" DOUBLE PRECISION,

    CONSTRAINT "TransactionBancaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcritureComptable" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "compteDebit" TEXT NOT NULL,
    "compteCredit" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "dateEcriture" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcritureComptable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RapportTVA" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "tvaCollectee" DECIMAL(65,30) NOT NULL,
    "tvaDeductible" DECIMAL(65,30) NOT NULL,
    "soldeTva" DECIMAL(65,30) NOT NULL,
    "anomalies" JSONB,

    CONSTRAINT "RapportTVA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employe" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nir" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "poste" TEXT NOT NULL,
    "conventionCollective" TEXT NOT NULL,
    "statut" "EmployeStatut" NOT NULL,

    CONSTRAINT "Employe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratTravail" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" "ContratType" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "salaireBrut" DECIMAL(65,30) NOT NULL,
    "tempsTravail" DECIMAL(65,30) NOT NULL,
    "documentUrl" TEXT NOT NULL,

    CONSTRAINT "ContratTravail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppelRecouvrement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "resultat" TEXT NOT NULL,
    "promesseMontant" DECIMAL(65,30),
    "promesseDate" TIMESTAMP(3),
    "rapportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppelRecouvrement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierDouane" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "packingListUrl" TEXT,
    "factureExportUrl" TEXT,
    "codesHs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DossierDouane_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_userId_organisationId_key" ON "OrgMember"("userId", "organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserModule_organisationId_key" ON "UserModule"("organisationId");

-- CreateIndex
CREATE INDEX "Subscription_organisationId_module_idx" ON "Subscription"("organisationId", "module");

-- CreateIndex
CREATE INDEX "AuditLog_organisationId_module_idx" ON "AuditLog"("organisationId", "module");

-- CreateIndex
CREATE INDEX "DossierJuridique_organisationId_idx" ON "DossierJuridique"("organisationId");

-- CreateIndex
CREATE INDEX "Client_organisationId_idx" ON "Client"("organisationId");

-- CreateIndex
CREATE INDEX "Devis_organisationId_clientId_idx" ON "Devis"("organisationId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_devisId_key" ON "Facture"("devisId");

-- CreateIndex
CREATE INDEX "Facture_organisationId_clientId_idx" ON "Facture"("organisationId", "clientId");

-- CreateIndex
CREATE INDEX "CompteBancaire_organisationId_idx" ON "CompteBancaire"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionBancaire_factureId_key" ON "TransactionBancaire"("factureId");

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModule" ADD CONSTRAINT "UserModule_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierJuridique" ADD CONSTRAINT "DossierJuridique_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJuridique" ADD CONSTRAINT "DocumentJuridique_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "DossierJuridique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesVerbal" ADD CONSTRAINT "ProcesVerbal_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneDocument" ADD CONSTRAINT "LigneDocument_devisId_fkey" FOREIGN KEY ("documentId") REFERENCES "Devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneDocument" ADD CONSTRAINT "LigneDocument_factureId_fkey" FOREIGN KEY ("documentId") REFERENCES "Facture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneDocument" ADD CONSTRAINT "LigneDocument_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportuniteCRM" ADD CONSTRAINT "OpportuniteCRM_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportuniteCRM" ADD CONSTRAINT "OpportuniteCRM_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDeFrais" ADD CONSTRAINT "NoteDeFrais_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDeFrais" ADD CONSTRAINT "NoteDeFrais_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteBancaire" ADD CONSTRAINT "CompteBancaire_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionBancaire" ADD CONSTRAINT "TransactionBancaire_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "CompteBancaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionBancaire" ADD CONSTRAINT "TransactionBancaire_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcritureComptable" ADD CONSTRAINT "EcritureComptable_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapportTVA" ADD CONSTRAINT "RapportTVA_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employe" ADD CONSTRAINT "Employe_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratTravail" ADD CONSTRAINT "ContratTravail_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppelRecouvrement" ADD CONSTRAINT "AppelRecouvrement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppelRecouvrement" ADD CONSTRAINT "AppelRecouvrement_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierDouane" ADD CONSTRAINT "DossierDouane_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
