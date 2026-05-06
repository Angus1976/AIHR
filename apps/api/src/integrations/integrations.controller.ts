import { Controller, Get } from '@nestjs/common';
import { LlmRouterService } from './llm-router.service';
import { TencentSmsService } from './tencent-sms.service';
import { WechatPayService } from './wechat-pay.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly wechatPay: WechatPayService,
    private readonly tencentSms: TencentSmsService,
    private readonly llm: LlmRouterService,
  ) {}

  @Get('capabilities')
  async capabilities() {
    const llmState = await this.llm.capabilityState();
    return {
      wechatMiniLogin: true,
      wechatPay: this.wechatPay.isConfigured() ? 'jsapi_ready' : 'stub',
      tencentSms: this.tencentSms.isConfigured() ? 'send_ready' : 'stub',
      tencentSignature: 'stub',
      llmRouter: llmState === 'db_routes' ? 'db_routes' : 'stub_only',
      notes: {
        pay: '平台单一商户；类目：人才服务',
        signature: '预留腾讯系电子签；当前返回 stub',
        llm: '路由与提示词存 PostgreSQL；真实推理调用仍为占位',
        sms: '腾讯云短信；模板需含 1 个参数（验证码）',
      },
    };
  }
}
