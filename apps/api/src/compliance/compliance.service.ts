import { ForbiddenException, Injectable } from '@nestjs/common';
import { PlatformRole, Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpsertComplianceTemplateDto } from './dto/upsert-compliance-template.dto';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  private hash(content: string) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async listTemplates(actor: JwtAccessPayload, purpose?: string) {
    const staff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    return this.prisma.complianceTemplate.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(purpose?.trim() ? { purpose: purpose.trim() } : {}),
        ...(staff ? {} : { enabled: true }),
      },
      orderBy: [{ purpose: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async upsertTemplate(actor: JwtAccessPayload, dto: UpsertComplianceTemplateDto) {
    this.assertStaff(actor);
    const purpose = dto.purpose.trim();
    const version = dto.version.trim();
    const content = dto.content;
    const row = await this.prisma.complianceTemplate.upsert({
      where: {
        tenantId_purpose_version: { tenantId: actor.tenantId, purpose, version },
      },
      create: {
        tenantId: actor.tenantId,
        purpose,
        version,
        title: dto.title.trim(),
        content,
        contentHash: this.hash(content),
        enabled: dto.enabled ?? true,
      },
      update: {
        title: dto.title.trim(),
        content,
        contentHash: this.hash(content),
        enabled: dto.enabled ?? true,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'TENANT',
      onBehalfOfId: actor.tenantId,
      action: 'COMPLIANCE_TEMPLATE_UPSERT',
      metadata: { templateId: row.id, purpose: row.purpose, version: row.version },
    });
    return row;
  }

  async createConsent(actor: JwtAccessPayload, dto: CreateConsentDto) {
    const contentHash = this.hash(dto.content);
    const row = await this.prisma.userConsent.create({
      data: {
        tenantId: actor.tenantId,
        userId: actor.sub,
        purpose: dto.purpose.trim(),
        version: dto.version.trim(),
        contentHash,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'USER',
      onBehalfOfId: actor.sub,
      action: 'USER_CONSENT_CREATE',
      metadata: {
        consentId: row.id,
        purpose: row.purpose,
        version: row.version,
        contentHash,
      },
    });
    return row;
  }

  async listMyConsents(actor: JwtAccessPayload) {
    return this.prisma.userConsent.findMany({
      where: { tenantId: actor.tenantId, userId: actor.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
