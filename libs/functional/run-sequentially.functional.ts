import { Task } from 'fp-ts/lib/Task';

/**
 * 비동기 제너레이터를 사용하여 작업을 순차적으로 실행
 */
export async function* runSequentially<T>(
  tasks: Array<Task<ReadonlyArray<T>>>,
): AsyncGenerator<ReadonlyArray<T>, void, unknown> {
  for (const task of tasks) {
    yield await task();
  }
}
