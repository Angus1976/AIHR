import { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

const KEY_PREFIX = 'throttler:v1:';

/**
 * 使用 Redis 固定时间窗计数，使多副本 / K8s 多 Pod 共享同一限流状态。
 * 未配置 Redis 时仍使用 @nestjs/throttler 默认的进程内存储。
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttlMs: number,
  ): Promise<{ totalHits: number; timeToExpire: number }> {
    const k = `${KEY_PREFIX}${key}`;
    const hits = await this.redis.incr(k);
    if (hits === 1) {
      await this.redis.pexpire(k, ttlMs);
    }
    const pttl = await this.redis.pttl(k);
    const timeToExpire =
      pttl > 0 ? Math.max(1, Math.ceil(pttl / 1000)) : 0;
    return { totalHits: hits, timeToExpire };
  }
}
