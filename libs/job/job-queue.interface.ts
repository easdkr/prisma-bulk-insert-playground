export interface JobQueue<T> {
  execute(jobs: (() => Promise<T>)[]): Promise<ReadonlyArray<T>>;
}
