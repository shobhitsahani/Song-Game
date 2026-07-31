import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from './utils/logger';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: config.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
      datasources: {
        db: {
          url: config.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await getPrisma().$connect();
    logger.info('Connected to PostgreSQL');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL', { error: String(error) });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL');
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
