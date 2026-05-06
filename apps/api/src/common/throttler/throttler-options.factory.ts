import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type Redis from 'ioredis';
import { RedisThrottlerStorage } from './redis-throttler.storage';

export function createThrottlerOptions(redis: Redis | null): ThrottlerModuleOptions {
  const base: ThrottlerModuleOptions = {
    throttlers: [
      {
        ttl: 60_000,
        limit: 400,
      },
    ],
    errorMessage: '请求过于频繁，请稍后再试',
  };
  if (!redis) {
    return base;
  }
  return {
    ...base,
    storage: new RedisThrottlerStorage(redis),
  };
}
