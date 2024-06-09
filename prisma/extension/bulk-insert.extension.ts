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
          /**
           * 병렬로 실행할 작업의 수 (동시에 시작하는 트랜잭션의 수, 커넥션 풀의 크기보다 작아야 함)
           */
          concurrency?: number;
          /**
           * 한 번에 처리할 데이터의 양 (동시에 삽입되는 데이터의 양 = bulkSize * concurrency)
           */
          bulkSize: number;
        },
      ) {
        const ctx = Prisma.getExtensionContext(this);
        const data = (args as any).data as any[];
        const select = (args as any).select as any;
        const concurrency = args.concurrency ?? 1;
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
