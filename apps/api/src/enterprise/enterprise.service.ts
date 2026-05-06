import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { CreateEnterpriseConfirmationDto } from './dto/create-enterprise-confirmation.dto';
import { UpsertEnterpriseDto } from './dto/upsert-enterprise.dto';

@Injectable()
export class EnterpriseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sms: SmsService,
  ) {}

  async listJobApplicationsForEnterprise(actor: JwtAccessPayload, enterpriseId: string) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    const ent = await this.prisma.enterprise.findFirst({
      where: { id: enterpriseId, tenantId: actor.tenantId },
    });
    if (!ent) {
      throw new NotFoundException('企业不存在');
    }
    return this.prisma.jobApplication.findMany({
      where: {
        tenantId: actor.tenantId,
        jobPosting: { enterpriseId: ent.id },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        jobPosting: { select: { id: true, title: true, status: true } },
        seeker: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async listForTenant(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    return this.prisma.enterprise.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        contactPhone: true,
        updatedAt: true,
      },
    });
  }

  async create(actor: JwtAccessPayload, dto: UpsertEnterpriseDto) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    const row = await this.prisma.enterprise.create({
      data: {
        tenantId: actor.tenantId,
        name: dto.name.trim(),
        contactEmail: dto.contactEmail?.trim().toLowerCase() || null,
        contactPhone: dto.contactPhone?.trim() || null,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: row.id,
      action: 'ENTERPRISE_CREATE',
      metadata: { enterpriseId: row.id, name: row.name },
    });
    return row;
  }

  async update(actor: JwtAccessPayload, enterpriseId: string, dto: UpsertEnterpriseDto) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    const ent = await this.prisma.enterprise.findFirst({
      where: { id: enterpriseId, tenantId: actor.tenantId },
    });
    if (!ent) {
      throw new NotFoundException('企业不存在');
    }
    const row = await this.prisma.enterprise.update({
      where: { id: ent.id },
      data: {
        name: dto.name.trim(),
        contactEmail: dto.contactEmail?.trim().toLowerCase() || null,
        contactPhone: dto.contactPhone?.trim() || null,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: row.id,
      action: 'ENTERPRISE_UPDATE',
      metadata: { enterpriseId: row.id, name: row.name },
    });
    return row;
  }

  async createConfirmation(
    actor: JwtAccessPayload,
    dto: CreateEnterpriseConfirmationDto,
  ) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    const enterprise = await this.prisma.enterprise.findFirst({
      where: { id: dto.enterpriseId, tenantId: actor.tenantId },
    });
    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }
    if (dto.jobPostingId) {
      const job = await this.prisma.jobPosting.findFirst({
        where: {
          id: dto.jobPostingId,
          tenantId: actor.tenantId,
          enterpriseId: enterprise.id,
        },
      });
      if (!job) {
        throw new NotFoundException('岗位不存在或不属于该企业');
      }
    }
    const row = await this.prisma.enterpriseConfirmation.create({
      data: {
        tenantId: actor.tenantId,
        enterpriseId: enterprise.id,
        type: dto.type,
        jobPostingId: dto.jobPostingId,
        note: dto.note,
        evidenceRef: dto.evidenceRef,
        performedById: actor.sub,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: enterprise.id,
      action: 'ENTERPRISE_CONFIRMATION',
      metadata: {
        confirmationId: row.id,
        type: dto.type,
        jobPostingId: dto.jobPostingId ?? null,
        note: dto.note ?? null,
        evidenceRef: dto.evidenceRef ?? null,
      },
    });
    return row;
  }

  private normalizeCnMobile(raw: string | null | undefined): string {
    if (!raw?.trim()) {
      throw new BadRequestException('企业未填写联系人手机');
    }
    const digits = raw.replace(/\D/g, '');
    if (!/^1[3-9]\d{9}$/.test(digits)) {
      throw new BadRequestException('联系人手机号格式无效');
    }
    return digits;
  }

  /** 向企业联系人发送短信验证码（平台代发，用于电话侧验证） */
  async sendContactSms(actor: JwtAccessPayload, enterpriseId: string) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    const ent = await this.prisma.enterprise.findFirst({
      where: { id: enterpriseId, tenantId: actor.tenantId },
    });
    if (!ent) {
      throw new NotFoundException('企业不存在');
    }
    const phone = this.normalizeCnMobile(ent.contactPhone);
    const result = await this.sms.sendEnterpriseContactOtp({
      tenantId: actor.tenantId,
      phone,
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: ent.id,
      action: 'ENTERPRISE_CONTACT_SMS',
      metadata: { phoneMasked: `${phone.slice(0, 3)}****${phone.slice(-4)}`, mode: result.mode },
    });
    return result;
  }
}
