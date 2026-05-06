import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MatchingService } from './matching.service';

@Module({
  imports: [AuditModule, AuthModule, NotificationsModule],
  controllers: [JobsController],
  providers: [JobsService, MatchingService],
})
export class JobsModule {}
