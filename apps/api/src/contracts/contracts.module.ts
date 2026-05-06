import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [AuditModule, AuthModule, NotificationsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
