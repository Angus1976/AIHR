import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ComplianceTemplatesController } from './compliance-templates.controller';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [ComplianceController, ComplianceTemplatesController],
  providers: [ComplianceService],
})
export class ComplianceModule {}
