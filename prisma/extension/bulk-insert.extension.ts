import { Prisma } from '@prisma/client';
import { flatten } from 'fp-ts/lib/Array';
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
        const { concurrency, bulkSize, ...rest } = args as any;

        const jobs = _createJobs(ctx, bulkSize, rest);

        console.time('쿼리 실행 시간');
        const res = await IterableJobQueue.of(concurrency ?? 1)
          .execute(jobs)
          .then(flatten); // createManyAndReturn의 반환값이 배열의 배열이므로 flatten을 사용하여 1차원 배열로 변환
        console.timeEnd('쿼리 실행 시간');

        return res;
      },
    },
  },
});

function _createJobs(
  ctx: any,
  bulkSize: number,
  createManyAndReturnArgs: Prisma.Args<any, 'createManyAndReturn'>,
) {
  return pipe(createManyAndReturnArgs.data, chunksOf(bulkSize), (chunks) =>
    chunks.map(
      (chunk) => () =>
        ctx.$parent[ctx.$name].createManyAndReturn({
          data: chunk,
          select: createManyAndReturnArgs.select,
          skipDuplicates: createManyAndReturnArgs.skipDuplicates,
        }),
    ),
  );
}
