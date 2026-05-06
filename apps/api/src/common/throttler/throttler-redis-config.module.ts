import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ThrottlerRedisLifecycle } from './throttler-redis-lifecycle.service';
import { THROTTLER_REDIS } from './throttler-redis.token';

/**
 * 提供限流用 Redis 客户端（可选），供 ThrottlerModule.forRootAsync 注入；未配置 URL 时为 null。
 */
@Global()
@Module({
  providers: [
    {
      provide: THROTTLER_REDIS,
      useFactory: (): Redis | null => {
        const url =
          (process.env.THROTTLER_REDIS_URL || process.env.REDIS_URL || '').trim();
        if (!url) {
          return null;
        }
        return new Redis(url, { maxRetriesPerRequest: 2, enableReadyCheck: true });
      },
    },
    ThrottlerRedisLifecycle,
  ],
  exports: [THROTTLER_REDIS],
})
export class ThrottlerRedisConfigModule {}
