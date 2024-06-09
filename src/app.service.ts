import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_TOKEN } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.type';

@Injectable()
export class AppService {
  public constructor(
    @Inject(PRISMA_TOKEN)
    private readonly prisma: PrismaService,
  ) {}

  public bulkCreateUsers = async () => {
    await this.prisma.user.createBulk({
      data: Array.from({ length: 100 }).map((_, i) => ({
        email: `email ${i}`,
        name: `name ${i}`,
        password: `password ${i}`,
      })),
      concurrency: 3,
      bulkSize: 7,
    });
  };
}
