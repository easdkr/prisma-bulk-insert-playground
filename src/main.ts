import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IterableJobQueue } from 'libs/job';
import { pipe } from 'fp-ts/lib/function';
import { chunksOf } from 'fp-ts/lib/ReadonlyArray';
import { Logger } from '@nestjs/common';
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const _prisma = app.get(PrismaService);
  const logger = new Logger('prisma');
  const prisma = _prisma.$extends({
    name: 'prisma-bulk-insert',
    model: {
      $allModels: {
        async createBulk<T, D>(
          this: T,
          args: Prisma.Exact<D, Prisma.Args<T, 'createMany'>> & {
            concurrency: number;
            bulkSize: number;
          },
        ) {
          const ctx = Prisma.getExtensionContext(this);
          const data = (args as any).data as any[];
          const concurrency = args.concurrency;
          const bulkSize = args.bulkSize;
          console.time('job 생성');
          const jobs = pipe(data, chunksOf(bulkSize), (chunks) =>
            chunks.map((chunk) => async () => {
              return await (ctx as any).$parent[ctx.$name as any].createMany({
                data: chunk,
              });
            }),
          );
          console.timeEnd('job 생성');

          console.time('전체 실행 시간');
          await IterableJobQueue.of(concurrency).execute(jobs);
          console.timeEnd('전체 실행 시간');
        },
      },
    },
  });

  await prisma.user.createBulk({
    data: Array.from({ length: 10000000 }).map((_, i) => ({
      email: `email ${i}`,
      name: `name ${i}`,
      password: `password ${i}`,
    })),
    concurrency: 1,
    bulkSize: 100000,
  });

  logger.log('DONE', await prisma.user.count());
  logger.debug(
    'CLOSE',
    await prisma.$queryRaw`TRUNCATE users RESTART IDENTITY CASCADE`,
  );
  await app.listen(3000);
}
bootstrap();
