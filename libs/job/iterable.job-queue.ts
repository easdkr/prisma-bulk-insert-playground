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
      chunksOf(this.concurrency),
      map(sequenceArray),
      runSequentially,
      toArrayAsync,
    ).then(flatten);
  }
}
