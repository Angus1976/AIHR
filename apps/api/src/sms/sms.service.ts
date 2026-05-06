import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SmsOtpPurpose } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TencentSmsService } from '../integrations/tencent-sms.service';
import { SendSmsOtpDto } from './dto/send-sms-otp.dto';
import { VerifySmsOtpDto } from './dto/verify-sms-otp.dto';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tencentSms: TencentSmsService,
  ) {}

  private pepper(): string {
    return process.env.SMS_CODE_PEPPER ?? 'dev-change-sms-pepper';
  }

  private hash(
    tenantId: string | null,
    phone: string,
    purpose: SmsOtpPurpose,
    code: string,
  ) {
    return crypto
      .createHmac('sha256', this.pepper())
      .update(`${tenantId ?? ''}|${phone}|${purpose}|${code}`)
      .digest('hex');
  }

  private async resolveTenantId(slug?: string): Promise<string | null> {
    if (!slug) return null;
    const t = await this.prisma.tenant.findUnique({ where: { slug } });
    return t?.id ?? null;
  }

  async sendOtp(dto: SendSmsOtpDto) {
    const tenantId = await this.resolveTenantId(dto.tenantSlug);
    const since = new Date(Date.now() - RESEND_COOLDOWN_MS);
    const recent = await this.prisma.smsOtp.count({
      where: { phone: dto.phone, createdAt: { gte: since } },
    });
    if (recent > 0) {
      throw new HttpException(
        '发送过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const codeHash = this.hash(tenantId, dto.phone, dto.purpose, code);
    await this.prisma.smsOtp.create({
      data: {
        tenantId,
        phone: dto.phone,
        purpose: dto.purpose,
        codeHash,
        expiresAt,
      },
    });
    await this.tencentSms.sendOtp(dto.phone, code);
    return {
      ok: true,
      mode: this.tencentSms.isConfigured() ? 'live' : 'stub',
      expiresInSec: OTP_TTL_MS / 1000,
    };
  }

  async verifyOtp(dto: VerifySmsOtpDto) {
    const tenantId = await this.resolveTenantId(dto.tenantSlug);
    const row = await this.prisma.smsOtp.findFirst({
      where: {
        phone: dto.phone,
        purpose: dto.purpose,
        consumedAt: null,
        ...(tenantId === null ? { tenantId: null } : { tenantId }),
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) {
      throw new BadRequestException('验证码无效或已使用');
    }
    if (row.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
      throw new BadRequestException('验证次数过多，请重新获取验证码');
    }
    await this.prisma.smsOtp.update({
      where: { id: row.id },
      data: { verifyAttempts: { increment: 1 } },
    });
    if (row.expiresAt < new Date()) {
      throw new BadRequestException('验证码已过期');
    }
    const expectHash = this.hash(tenantId, dto.phone, dto.purpose, dto.code);
    if (expectHash !== row.codeHash) {
      throw new BadRequestException('验证码错误');
    }
    await this.prisma.smsOtp.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    });
    return { ok: true };
  }

  /** 向企业联系人手机发送验证码（就业老师/管理员代发） */
  async sendEnterpriseContactOtp(params: {
    tenantId: string;
    phone: string;
  }) {
    const tenantId = params.tenantId;
    const since = new Date(Date.now() - RESEND_COOLDOWN_MS);
    const recent = await this.prisma.smsOtp.count({
      where: {
        phone: params.phone,
        purpose: SmsOtpPurpose.ENTERPRISE_CONTACT_VERIFY,
        tenantId,
        createdAt: { gte: since },
      },
    });
    if (recent > 0) {
      throw new HttpException(
        '发送过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const codeHash = this.hash(tenantId, params.phone, SmsOtpPurpose.ENTERPRISE_CONTACT_VERIFY, code);
    await this.prisma.smsOtp.create({
      data: {
        tenantId,
        phone: params.phone,
        purpose: SmsOtpPurpose.ENTERPRISE_CONTACT_VERIFY,
        codeHash,
        expiresAt,
      },
    });
    await this.tencentSms.sendOtp(params.phone, code);
    return {
      ok: true,
      mode: this.tencentSms.isConfigured() ? 'live' : 'stub',
      expiresInSec: OTP_TTL_MS / 1000,
    };
  }
}
