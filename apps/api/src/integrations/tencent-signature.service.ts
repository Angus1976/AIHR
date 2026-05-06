import { Injectable, Logger } from '@nestjs/common';

/**
 * 电子签占位：优先对接腾讯云电子签（ESS）或腾讯系 CA 能力。
 * 未选定供应商前，仅保留发起流程、回调验签的接口形状。
 */
@Injectable()
export class TencentSignatureService {
  private readonly logger = new Logger(TencentSignatureService.name);

  createSignFlowStub(params: {
    tenantId: string;
    templateId: string;
    subject: string;
  }) {
    this.logger.warn(`电子签占位: subject=${params.subject}`);
    return {
      mode: 'stub',
      flowId: `stub_${params.tenantId}_${Date.now()}`,
      message: '请接入腾讯云电子签或选定 CA 后实现',
    };
  }
}
