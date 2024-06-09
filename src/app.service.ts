import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_TOKEN } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.type';

@Injectable()
export class AppService {
  public constructor(
    @Inject(PRISMA_TOKEN)
    private readonly prisma: PrismaService,
  ) {}

  public bulkCreateUsers = async (length: number) => {
    const bulkCreateResult = await this.prisma.user.createBulk({
      data: Array.from({ length }).map((_, i) => ({
        email: `email ${i}`,
        name: `name ${i}`,
        password: `password ${i}`,
      })),
      select: { id: true },
      concurrency: 10,
      bulkSize: 100,
    });
    console.log('생성된 유저 수 : ', bulkCreateResult.length);
    return bulkCreateResult;
  };
}
