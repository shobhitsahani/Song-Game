/*
 * Database connection commented out — PostgreSQL not required without auth.
 * Restore when backend infrastructure is set up.
 *
 * import { PrismaClient } from '@prisma/client';
 * import { env } from './env.js';
 *
 * export const prisma = new PrismaClient({ log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });
 * export async function connectDatabase(): Promise<void> { await prisma.$connect(); console.log('[DB] Connected to PostgreSQL'); }
 * export async function disconnectDatabase(): Promise<void> { await prisma.$disconnect(); }
 */

import { PrismaClient } from '@prisma/client';

/* Dummy prisma — no real DB connection */
export const prisma = {} as PrismaClient;

export async function connectDatabase(): Promise<void> {
  console.log('[DB] Skipped (auth disabled)');
}

export async function disconnectDatabase(): Promise<void> {
  console.log('[DB] Disconnect skipped (auth disabled)');
}
