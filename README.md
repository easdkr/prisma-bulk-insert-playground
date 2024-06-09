# Prisma bulk insert playground

> **배치 처리 등 매우 많은 데이터 동시 처리 시 prisma가 동작하지 않고, 더 빠른 실행을 위해 `bulkCreate` 메서드 확장**

실험 결과
10,000,000 건의 삽입 요청 시

> **concurrency : 10, bulkSize : 100000**
>
> - 전체 실행 시간: 1:11.499 (m:ss.mmm)
>
> **concurrency: 1, bulkSize: 100000**
>
> - 전체 실행 시간: 2:41.523 (m:ss.mmm)
