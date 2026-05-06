import { Injectable, Logger } from '@nestjs/common';

// CommonJS SDK（避免 ESM 与 Nest 编译差异）
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tencentcloud = require('tencentcloud-sdk-nodejs');

/**
 * 腾讯云短信（国内短信 SendSms）。
 * 需在控制台创建签名、模板（建议单参数验证码，如 {1}）。
 * @see https://cloud.tencent.com/document/product/382/43197
 */
@Injectable()
export class TencentSmsService {
  private readonly logger = new Logger(TencentSmsService.name);

  isConfigured(): boolean {
    return Boolean(
      process.env.TENCENTCLOUD_SECRET_ID?.trim() &&
        process.env.TENCENTCLOUD_SECRET_KEY?.trim() &&
        process.env.SMS_SDK_APP_ID?.trim() &&
        process.env.SMS_SIGN_NAME?.trim() &&
        process.env.SMS_TEMPLATE_ID_OTP?.trim(),
    );
  }

  /** phone 形如 13800138000（不含 +86） */
  async sendOtp(phone11: string, code: string): Promise<{ requestId?: string }> {
    if (!this.isConfigured()) {
      this.logger.warn(`短信 stub: phone=${phone11.slice(0, 3)}**** 未发送`);
      return { requestId: 'stub' };
    }
    const secretId = process.env.TENCENTCLOUD_SECRET_ID!.trim();
    const secretKey = process.env.TENCENTCLOUD_SECRET_KEY!.trim();
    const region = process.env.SMS_REGION?.trim() || 'ap-guangzhou';
    const SmsClient = tencentcloud.sms.v20210111.Client as new (cfg: {
      credential: { secretId: string; secretKey: string };
      region: string;
      profile: { httpProfile: { endpoint: string } };
    }) => { SendSms: (req: Record<string, unknown>) => Promise<unknown> };
    const client = new SmsClient({
      credential: { secretId, secretKey },
      region,
      profile: { httpProfile: { endpoint: 'sms.tencentcloudapi.com' } },
    });
    const phoneSet = [`+86${phone11}`];
    const res = (await client.SendSms({
      SmsSdkAppId: process.env.SMS_SDK_APP_ID!.trim(),
      SignName: process.env.SMS_SIGN_NAME!.trim(),
      TemplateId: process.env.SMS_TEMPLATE_ID_OTP!.trim(),
      TemplateParamSet: [code],
      PhoneNumberSet: phoneSet,
    })) as { RequestId?: string; SendStatusSet?: { Code?: string; Message?: string }[] };
    const first = res.SendStatusSet?.[0];
    if (first?.Code && first.Code !== 'Ok') {
      throw new Error(first.Message ?? first.Code);
    }
    return { requestId: res.RequestId };
  }
}
