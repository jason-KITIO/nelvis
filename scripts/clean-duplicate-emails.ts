import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

config({ path: resolve(__dirname, '../.env.local') });

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquante');
}

const adapterConfig = { connectionString: process.env.DATABASE_URL };
const adapter = new PrismaNeon(adapterConfig);

const prisma = new PrismaClient({ adapter });

async function cleanDuplicateEmails() {
  console.log('🔍 Recherche des emails en double...');

  const duplicates = await prisma.$queryRaw<{ email: string; count: bigint }[]>`
    SELECT email, COUNT(*) as count
    FROM "Client"
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  console.log(`📊 ${duplicates.length} emails en double trouvés`);

  for (const dup of duplicates) {
    console.log(`\n📧 Email: ${dup.email} (${dup.count} occurrences)`);

    const clients = await prisma.client.findMany({
      where: { email: dup.email },
      orderBy: { id: 'asc' },
    });

    const [keep, ...toDelete] = clients;
    console.log(`  ✅ Garder: ${keep.id} - ${keep.nom}`);

    for (const client of toDelete) {
      console.log(`  ❌ Modifier email: ${client.id} - ${client.nom}`);
      await prisma.client.update({
        where: { id: client.id },
        data: { email: `${client.email}.duplicate.${client.id}` },
      });
    }
  }

  console.log('\n✨ Nettoyage terminé !');
}

cleanDuplicateEmails()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
