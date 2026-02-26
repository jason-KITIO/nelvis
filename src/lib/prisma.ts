// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquante dans .env.local');
}

const adapterConfig = { connectionString: process.env.DATABASE_URL! };
const adapter = new PrismaNeon(adapterConfig);  // ✅ PoolConfig objet direct

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : []
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
