import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Connect to the database
 */
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

/**
 * Export Prisma instance for queries
 */
export { prisma };
