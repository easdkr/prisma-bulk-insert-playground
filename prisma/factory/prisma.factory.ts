import { PrismaClient } from '@prisma/client';
import { BulkInsertExtension } from 'prisma/extension';

export class PrismaFactory {
  public static createExtended() {
    // Create a new PrismaClient instance
    const prisma = new PrismaClient({
      log: ['query'],
    });

    // Extend the PrismaClient instance with the BulkInsertExtension
    return prisma.$extends(BulkInsertExtension);
  }
}
