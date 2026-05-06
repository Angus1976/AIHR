import { SmsOtpPurpose } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class SendSmsOtpDto {
  /** 中国大陆 11 位手机号 */
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效手机号' })
  phone!: string;

  @IsEnum(SmsOtpPurpose)
  purpose!: SmsOtpPurpose;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
