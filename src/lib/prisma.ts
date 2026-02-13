import { PrismaClient } from "@prisma/client";

// Prevent hot-reload from spawning a new PrismaClient on every file change.
// In production there's only one process, so this is a no-op.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
