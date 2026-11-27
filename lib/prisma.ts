import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  const candidate = path.resolve(process.cwd(), 'prisma', 'dev.db');

  if (!envUrl || envUrl === 'file:./dev.db' || envUrl === 'file:./prisma/dev.db') {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }
  return envUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
