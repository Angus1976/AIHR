import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenantController } from './tenant.controller';
import { TenantModule } from './tenant.module';

@Module({
  imports: [AuthModule, TenantModule],
  controllers: [TenantController],
})
export class TenantSettingsModule {}
