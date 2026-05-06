import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { InterviewOpportunitiesController } from './interview-opportunities.controller';
import { InterviewOpportunitiesService } from './interview-opportunities.service';

@Module({
  imports: [AuditModule, AuthModule, NotificationsModule],
  controllers: [InterviewOpportunitiesController],
  providers: [InterviewOpportunitiesService],
})
export class InterviewOpportunitiesModule {}
