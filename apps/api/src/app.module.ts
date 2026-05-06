import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { createThrottlerOptions } from './common/throttler/throttler-options.factory';
import { ThrottlerRedisConfigModule } from './common/throttler/throttler-redis-config.module';
import { THROTTLER_REDIS } from './common/throttler/throttler-redis.token';
import { ConfigModule } from '@nestjs/config';
import type Redis from 'ioredis';
import { AiModule } from './ai/ai.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CommerceModule } from './commerce/commerce.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ContractsModule } from './contracts/contracts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { InterviewOpportunitiesModule } from './interview-opportunities/interview-opportunities.module';
import { JobsModule } from './jobs/jobs.module';
import { MeModule } from './me/me.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PartnersModule } from './partners/partners.module';
import { PaymentsModule } from './payments/payments.module';
import { ServicePlansModule } from './service-plans/service-plans.module';
import { SmsModule } from './sms/sms.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantSettingsModule } from './tenant/tenant-settings.module';
import { UsersModule } from './users/users.module';
import { WechatModule } from './wechat/wechat.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ThrottlerRedisConfigModule],
      inject: [THROTTLER_REDIS],
      useFactory: (redis: Redis | null) => createThrottlerOptions(redis),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuditModule,
    PrismaModule,
    TenantModule,
    WechatModule,
    AuthModule,
    HealthModule,
    EnterpriseModule,
    InterviewOpportunitiesModule,
    JobsModule,
    MeModule,
    PaymentsModule,
    SmsModule,
    IntegrationsModule,
    AiModule,
    CommerceModule,
    ComplianceModule,
    PartnersModule,
    NotificationsModule,
    ContractsModule,
    DashboardModule,
    TenantSettingsModule,
    UsersModule,
    ServicePlansModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
