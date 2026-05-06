import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import type Redis from 'ioredis';
import { THROTTLER_REDIS } from './throttler-redis.token';

@Injectable()
export class ThrottlerRedisLifecycle implements OnApplicationShutdown {
  constructor(
    @Inject(THROTTLER_REDIS) private readonly redis: Redis | null,
  ) {}

  async onApplicationShutdown() {
    if (this.redis) {
      await this.redis.quit().catch(() => undefined);
    }
  }
}
