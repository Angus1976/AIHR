import { SmsOtpPurpose } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class VerifySmsOtpDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  phone!: string;

  @IsEnum(SmsOtpPurpose)
  purpose!: SmsOtpPurpose;

  @IsString()
  @Length(4, 8)
  code!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
