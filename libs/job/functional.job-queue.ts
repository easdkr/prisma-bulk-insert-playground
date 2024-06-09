import type { JobQueue } from './job-queue.interface';
import { chunksOf, map, reduce } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { concatW } from 'fp-ts/lib/ReadonlyArray';
import {
  chain,
  map as mapTask,
  of,
  sequenceArray,
  type Task,
} from 'fp-ts/lib/Task';

/**
 * @deprecated
 * 사용하지 않음
 */
export class FunctionalJobQueue<T> implements JobQueue<T> {
  private constructor(private readonly concurrency: number) {}

  public static of = <T>(concurrency: number) =>
    new FunctionalJobQueue<T>(concurrency);

  public async execute(jobs: (() => Promise<T>)[]): Promise<ReadonlyArray<T>> {
    const chunkedTasks = pipe(jobs, this.chunk, map(sequenceArray));
    return await this.runSequentially(chunkedTasks)();
  }

  private runSequentially = (
    tasks: Array<Task<ReadonlyArray<T>>>,
  ): Task<ReadonlyArray<T>> =>
    pipe(
      tasks,
      reduce(of<ReadonlyArray<T>>([]), (acc, task) =>
        pipe(
          acc,
          chain((results) =>
            pipe(
              task,
              mapTask((res) => concatW(res)(results)),
            ),
          ),
        ),
      ),
    );

  private chunk = (jobs: (() => Promise<T>)[]) =>
    pipe(jobs, chunksOf(this.concurrency));
}
