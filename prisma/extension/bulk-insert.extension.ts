import { Prisma } from '@prisma/client';
import { pipe } from 'fp-ts/lib/function';
import { chunksOf } from 'fp-ts/lib/ReadonlyArray';
import { IterableJobQueue } from 'libs/job';

export const BulkInsertExtension = Prisma.defineExtension({
  name: 'bulk-insert',
  model: {
    $allModels: {
      async createBulk<T, D>(
        this: T,
        args: Prisma.Exact<D, Prisma.Args<T, 'createManyAndReturn'>> & {
          concurrency: number;
          bulkSize: number;
        },
      ) {
        const ctx = Prisma.getExtensionContext(this);
        const data = (args as any).data as any[];
        const select = (args as any).select as any;
        const concurrency = args.concurrency;
        const bulkSize = args.bulkSize;
        const name = ctx.$name;

        console.time('job 생성 시간');
        const jobs = _createJobs(ctx, name, data, select, bulkSize);
        console.timeEnd('job 생성 시간');

        console.time('쿼리 실행 시간');
        await IterableJobQueue.of(concurrency).execute(jobs);
        console.timeEnd('쿼리 실행 시간');
      },
    },
  },
});

// TODO: 위치 및 이름 변경, 파라미터 객체화
function _createJobs(
  ctx: any,
  name: string,
  data: any[],
  select: any,
  bulkSize: number,
) {
  return pipe(data, chunksOf(bulkSize), (chunks) =>
    chunks.map(
      (chunk) => () =>
        ctx.$parent[name].createManyAndReturn({ data: chunk, select }),
    ),
  );
}
