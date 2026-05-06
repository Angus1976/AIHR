import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const logQueries = process.env.PRISMA_LOG_QUERIES === 'true';
    super({
      log: logQueries
        ? (['query', 'error', 'warn'] as const)
        : process.env.NODE_ENV === 'production'
          ? (['error'] as const)
          : (['warn', 'error'] as const),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
