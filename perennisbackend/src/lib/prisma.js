// perennisbackend/src/lib/prisma.js
import { PrismaClient } from '@studio-perennis/database';

const prisma = globalThis.prisma || new PrismaClient({ log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
