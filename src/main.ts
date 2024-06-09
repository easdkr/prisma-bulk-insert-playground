import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from 'prisma/prisma.type';
import { PRISMA_TOKEN } from 'prisma/prisma.module';
import { AppService } from './app.service';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prisma: PrismaService = app.get(PRISMA_TOKEN);
  const appService = app.get(AppService);
  await appService.bulkCreateUsers(10000);

  console.log('생성된 유저 수 : ', await prisma.user.count());
  await prisma.$queryRaw`TRUNCATE users RESTART IDENTITY CASCADE`;

  await app.listen(3000);
}
bootstrap();
