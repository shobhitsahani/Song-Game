import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function connectDatabase() {
  await prisma.$connect();
  return prisma;
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export { prisma };
