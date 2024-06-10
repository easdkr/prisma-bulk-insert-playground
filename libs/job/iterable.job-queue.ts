import type { JobQueue } from './job-queue.interface';
import { chunksOf, map } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { flatten } from 'fp-ts/lib/ReadonlyArray';
import { sequenceArray } from 'fp-ts/lib/Task';
import { runSequentially, toArrayAsync } from 'libs/functional';

export class IterableJobQueue<T> implements JobQueue<T> {
  private constructor(private readonly concurrency: number) {}

  public static of = <T>(concurrency: number) =>
    new IterableJobQueue<T>(concurrency);

  public async execute(jobs: (() => Promise<T>)[]): Promise<ReadonlyArray<T>> {
    return await pipe(
      jobs,
      chunksOf(this.concurrency), // 작업을 동시성 수준에 따라 청크로 나눔
      map(sequenceArray), // 청크를 순차적으로 실행할 수 있는 Task로 변환
      runSequentially, // 각 청크 Task를 순차적으로 실행하고 결과를 방출
      toArrayAsync, // AsyncIterable을 배열로 변환
    ).then(flatten); // 각 청크 결과를 하나의 배열로 평탄화
  }
}
