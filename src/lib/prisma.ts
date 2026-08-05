import { PrismaClient } from '@prisma/client';

// Singleton : en développement, le rechargement à chaud recrée le module à
// chaque modification. Sans ce cache global, on ouvrirait une connexion de plus
// à chaque fois.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
