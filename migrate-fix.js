const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Supprimer les contraintes
    await client.query('ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_devisId_fkey"');
    console.log('Dropped LigneDocument_devisId_fkey');

    await client.query('ALTER TABLE "LigneDocument" DROP CONSTRAINT IF EXISTS "LigneDocument_factureId_fkey"');
    console.log('Dropped LigneDocument_factureId_fkey');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
