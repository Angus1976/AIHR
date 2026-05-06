import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant/tenant.module';
import { WechatService } from './wechat.service';

@Module({
  imports: [TenantModule],
  providers: [WechatService],
  exports: [WechatService],
})
export class WechatModule {}
