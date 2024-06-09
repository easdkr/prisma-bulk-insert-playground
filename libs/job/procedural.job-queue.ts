import type { JobQueue } from './job-queue.interface';

export class ProceduralJobQueue<T> implements JobQueue<T> {
  private constructor(private readonly concurrency: number) {}

  public static of = <T>(concurrency: number) =>
    new ProceduralJobQueue<T>(concurrency);

  async execute(jobs: (() => Promise<T>)[]): Promise<ReadonlyArray<T>> {
    const results: T[] = [];
    const queue = Array.from(jobs); // 작업을 복사

    while (queue.length > 0) {
      const chunk = queue.splice(0, this.concurrency); // 작업을 청크로 나눔
      const chunkResults = await Promise.all(chunk.map((job) => job()));
      results.push(...chunkResults); // 결과를 누적
    }

    return results;
  }
}
