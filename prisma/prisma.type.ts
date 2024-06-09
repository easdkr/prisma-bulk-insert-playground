import { PrismaClient } from '@prisma/client';
import { PrismaFactory } from './factory';

export type TransactionManager = Parameters<
  Parameters<PrismaClient['$transaction']>[0]
>[0];

export type PrismaService = ReturnType<
  (typeof PrismaFactory)['createExtended']
>;
