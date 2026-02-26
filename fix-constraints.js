require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const adapterConfig = { connectionString: process.env.DATABASE_URL };
const adapter = new PrismaNeon(adapterConfig);
const prisma = new PrismaClient({ adapter });

async function removeConstraints() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_devisId_fkey"');
    console.log('✓ Contrainte LigneDocument_devisId_fkey supprimée');
    
    await prisma.$executeRawUnsafe('ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_factureId_fkey"');
    console.log('✓ Contrainte LigneDocument_factureId_fkey supprimée');
    
    console.log('\n✅ Toutes les contraintes invalides ont été supprimées');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

removeConstraints();
