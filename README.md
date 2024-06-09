# Prisma bulk insert playground

실험 결과
10,000,000 건의 삽입 요청 시

> **concurrency : 10, bulkSize : 100000**
>
> - 전체 실행 시간: 1:11.499 (m:ss.mmm)
>
> **concurrency: 1, bulkSize: 100000**
>
> - 전체 실행 시간: 2:41.523 (m:ss.mmm)
