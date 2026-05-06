import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContractStatus, PlatformRole } from '@prisma/client';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';

@Injectable()
export class ContractsService {
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

  private hash(content: string) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async create(actor: JwtAccessPayload, dto: CreateContractDto) {
    this.assertStaff(actor);
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, tenantId: actor.tenantId },
    });
    if (!user) throw new NotFoundException('用户不存在');
    const template = dto.templateId
      ? await this.prisma.complianceTemplate.findFirst({
          where: { id: dto.templateId, tenantId: actor.tenantId },
        })
      : null;
    if (dto.templateId && !template) throw new NotFoundException('合规模板不存在');
    const content = dto.content?.trim() || template?.content;
    if (!content) {
      throw new BadRequestException('请提供合同正文或选择模板');
    }
    const row = await this.prisma.contractAgreement.create({
      data: {
        tenantId: actor.tenantId,
        userId: user.id,
        enterpriseId: dto.enterpriseId || null,
        orderId: dto.orderId || null,
        jobApplicationId: dto.jobApplicationId || null,
        templateId: template?.id ?? null,
        title: dto.title.trim(),
        contentHash: this.hash(content),
        signatureProvider: 'tencent-signature-stub',
        signatureStatus: 'CREATED',
      },
      include: { user: { select: { id: true, displayName: true, phone: true, email: true } } },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'USER',
      onBehalfOfId: user.id,
      action: 'CONTRACT_CREATE',
      metadata: { contractId: row.id, title: row.title, templateId: template?.id ?? null },
    });
    await this.notifications.create({
      tenantId: actor.tenantId,
      userId: user.id,
      title: '待签署协议已生成',
      body: `协议「${row.title}」已生成，请在小程序查看。`,
      category: 'CONTRACT',
      metadata: { contractId: row.id },
    });
    return row;
  }

  async listForStaff(actor: JwtAccessPayload) {
    this.assertStaff(actor);
    return this.prisma.contractAgreement.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, displayName: true, phone: true, email: true } },
        enterprise: { select: { id: true, name: true } },
      },
    });
  }

  async listMine(actor: JwtAccessPayload) {
    return this.prisma.contractAgreement.findMany({
      where: { tenantId: actor.tenantId, userId: actor.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async signStub(actor: JwtAccessPayload, id: string, dto: SignContractDto) {
    const row = await this.prisma.contractAgreement.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    if (!row) throw new NotFoundException('协议不存在');
    const isOwner = row.userId === actor.sub;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException();
    if (row.status === ContractStatus.SIGNED) return row;
    const updated = await this.prisma.contractAgreement.update({
      where: { id: row.id },
      data: {
        status: ContractStatus.SIGNED,
        signatureProvider: dto.provider?.trim() || row.signatureProvider || 'stub',
        signatureStatus: 'SIGNED',
        signatureRef: dto.signatureRef?.trim() || `stub-${row.id}`,
        signedAt: new Date(),
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'CONTRACT',
      onBehalfOfId: row.id,
      action: 'CONTRACT_SIGN_STUB',
      metadata: { contractId: row.id, signatureRef: updated.signatureRef },
    });
    return updated;
  }
}
