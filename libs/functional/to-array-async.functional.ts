/**
 * 비동기 이터러블을 배열로 변환
 */
export async function toArrayAsync<T>(iterable: AsyncIterable<T>) {
  const result: T[] = [];

  for await (const value of iterable) {
    result.push(value);
  }

  return result;
}
