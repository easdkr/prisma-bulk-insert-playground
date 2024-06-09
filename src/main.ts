import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from 'prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { BulkInsertExtension } from 'prisma/extension/bulk-insert.extension';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const _prisma = app.get(PrismaService);
  const logger = new Logger('prisma');

  const prisma = _prisma.$extends(BulkInsertExtension);

  await prisma.user.createBulk({
    data: Array.from({ length: 100 }).map((_, i) => ({
      email: `email ${i}`,
      name: `name ${i}`,
      password: `password ${i}`,
    })),
    concurrency: 3,
    bulkSize: 7,
  });

  logger.log('DONE', await prisma.user.count());
  logger.debug(
    'CLOSE',
    await prisma.$queryRaw`TRUNCATE users RESTART IDENTITY CASCADE`,
  );
  await app.listen(3000);
}
bootstrap();
