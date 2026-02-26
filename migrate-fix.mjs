import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Dropping LigneDocument_devisId_fkey...');
    await prisma.$executeRawUnsafe('ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_devisId_fkey"');
    
    console.log('Dropping LigneDocument_factureId_fkey...');
    await prisma.$executeRawUnsafe('ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_factureId_fkey"');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
