import type { JobQueue } from './job-queue.interface';
import { chunksOf, map } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { flatten } from 'fp-ts/lib/ReadonlyArray';
import { sequenceArray, type Task } from 'fp-ts/lib/Task';

export class IterableJobQueue<T> implements JobQueue<T> {
  private constructor(private readonly concurrency: number) {}

  public static of = <T>(concurrency: number) =>
    new IterableJobQueue<T>(concurrency);

  public async execute(jobs: (() => Promise<T>)[]): Promise<ReadonlyArray<T>> {
    return await pipe(
      jobs,
      chunksOf(this.concurrency),
      map(sequenceArray),
      this.runSequentially,
      this.toArrayAsync,
    ).then(flatten);
  }

  /**
   * 비동기 제너레이터를 사용하여 작업을 순차적으로 실행
   */
  private async *runSequentially(
    tasks: Array<Task<ReadonlyArray<T>>>,
  ): AsyncGenerator<ReadonlyArray<T>, void, unknown> {
    for (const task of tasks) {
      yield await task();
    }
  }

  /**
   * 비동기 이터러블을 배열로 변환
   */
  private async toArrayAsync<T>(iterable: AsyncIterable<T>) {
    const result: T[] = [];

    for await (const value of iterable) {
      // console.log('value:', value);
      result.push(value);
    }

    return result;
  }
}
