import { Controller, Get, Inject, Optional, Req, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import type Redis from 'ioredis';
import { THROTTLER_REDIS } from '../common/throttler/throttler-redis.token';
import { PrismaService } from '../prisma/prisma.service';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(THROTTLER_REDIS)
    private readonly throttleRedis: Redis | null,
  ) {}

  /** 就绪探针：可访问且数据库可连时返回 200，供编排/负载均衡与 Docker healthcheck。若配置了限流 Redis 则同时探测。 */
  @Get()
  async ok(@Req() req: Request) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      this.failDb(e, req);
    }

    if (this.throttleRedis) {
      try {
        const pong = await this.throttleRedis.ping();
        if (pong !== 'PONG') {
          throw new Error(`Redis PING 非 PONG: ${pong}`);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        throw new ServiceUnavailableException({
          status: 'error',
          service: 'jobde-api',
          checks: { database: 'up' as const, redis: 'down' as const, detail: message },
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      status: 'ok',
      service: 'jobde-api',
      checks: {
        database: 'up' as const,
        redis: (this.throttleRedis ? 'up' : 'skipped') as 'up' | 'skipped',
      },
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    };
  }

  private failDb(e: unknown, req: Request) {
    const message = e instanceof Error ? e.message : String(e);
    throw new ServiceUnavailableException({
      status: 'error',
      service: 'jobde-api',
      checks: { database: 'down' as const, detail: message },
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
