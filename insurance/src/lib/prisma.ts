import { PrismaClient } from "@/generated/prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  (typeof window === "undefined" // Ensure Prisma is only used on the server
    ? new PrismaClient({
        log: ["query", "info", "warn", "error"],
      })
    : undefined);

if (process.env.NODE_ENV !== "production" && typeof window === "undefined") {
  globalForPrisma.prisma = prisma!;
}

export default prisma!;