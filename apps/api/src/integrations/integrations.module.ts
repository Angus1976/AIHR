import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsController } from './integrations.controller';
import { LlmRouterService } from './llm-router.service';
import { TencentMeetingService } from './tencent-meeting.service';
import { TencentSignatureService } from './tencent-signature.service';
import { TencentSmsService } from './tencent-sms.service';
import { TencentTrtcService } from './tencent-trtc.service';
import { WechatPayService } from './wechat-pay.service';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationsController],
  providers: [
    WechatPayService,
    TencentSignatureService,
    TencentSmsService,
    LlmRouterService,
    TencentMeetingService,
    TencentTrtcService,
  ],
  exports: [
    WechatPayService,
    TencentSignatureService,
    TencentSmsService,
    LlmRouterService,
    TencentMeetingService,
    TencentTrtcService,
  ],
})
export class IntegrationsModule {}
