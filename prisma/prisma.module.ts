import { Global, Module } from '@nestjs/common';
import { PrismaFactory } from './factory';

export const PRISMA_TOKEN = '__PRISMA_TOKEN__';

@Global()
@Module({})
export class PrismaModule {
  static forRoot() {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_TOKEN,
          useValue: PrismaFactory.createExtended(),
        },
      ],
      exports: [PRISMA_TOKEN],
    };
  }
}
