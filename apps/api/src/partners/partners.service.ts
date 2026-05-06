import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PartnerApplicationStatus, PlatformRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { ReviewPartnerApplicationDto } from './dto/review-partner-application.dto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  async createApplication(actor: JwtAccessPayload, dto: CreatePartnerApplicationDto) {
    const row = await this.prisma.partnerApplication.create({
      data: {
        tenantId: actor.tenantId,
        submittedById: actor.sub,
        orgName: dto.orgName.trim(),
        contactName: dto.contactName.trim(),
        contactPhone: dto.contactPhone?.trim() || null,
        contactEmail: dto.contactEmail?.trim().toLowerCase() || null,
        category: dto.category.trim(),
        qualification: dto.qualification?.trim() || null,
        courseSummary: dto.courseSummary?.trim() || null,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'PARTNER_APPLICATION',
      onBehalfOfId: row.id,
      action: 'PARTNER_APPLICATION_CREATE',
      metadata: { applicationId: row.id, orgName: row.orgName, category: row.category },
    });
    return row;
  }

  async listMine(actor: JwtAccessPayload) {
    return this.prisma.partnerApplication.findMany({
      where: { tenantId: actor.tenantId, submittedById: actor.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async listForStaff(actor: JwtAccessPayload, status?: string) {
    this.assertStaff(actor);
    const statusFilter = status?.trim();
    if (
      statusFilter &&
      !Object.values(PartnerApplicationStatus).includes(
        statusFilter as PartnerApplicationStatus,
      )
    ) {
      throw new BadRequestException('无效的审核状态');
    }
    return this.prisma.partnerApplication.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(statusFilter ? { status: statusFilter as PartnerApplicationStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        submittedBy: { select: { id: true, displayName: true, phone: true, email: true } },
      },
    });
  }

  async review(actor: JwtAccessPayload, id: string, dto: ReviewPartnerApplicationDto) {
    this.assertStaff(actor);
    const row = await this.prisma.partnerApplication.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    if (!row) {
      throw new NotFoundException('入驻申请不存在');
    }
    const updated = await this.prisma.partnerApplication.update({
      where: { id: row.id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote?.trim() || null,
        reviewedById: actor.sub,
      },
      include: {
        submittedBy: { select: { id: true, displayName: true, phone: true, email: true } },
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'PARTNER_APPLICATION',
      onBehalfOfId: row.id,
      action: 'PARTNER_APPLICATION_REVIEW',
      metadata: {
        applicationId: row.id,
        from: row.status,
        to: dto.status,
        reviewNote: dto.reviewNote?.trim() || null,
      },
    });
    await this.notifications.create({
      tenantId: actor.tenantId,
      userId: row.submittedById,
      title: '伙伴入驻审核已更新',
      body: `「${row.orgName}」的入驻申请状态已更新为 ${dto.status}`,
      category: 'PARTNER_APPLICATION',
      metadata: {
        applicationId: row.id,
        status: dto.status,
      },
    });
    return updated;
  }
}
