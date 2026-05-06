import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServicePlansController } from './service-plans.controller';
import { ServicePlansService } from './service-plans.service';

@Module({
  imports: [AuditModule, AuthModule, IntegrationsModule, NotificationsModule],
  controllers: [ServicePlansController],
  providers: [ServicePlansService],
  exports: [ServicePlansService],
})
export class ServicePlansModule {}
