import { Injectable } from '@nestjs/common';
import { AuditActorType, PlatformRole, Prisma } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    performedById?: string;
    actorType?: AuditActorType;
    onBehalfOfType: string;
    onBehalfOfId: string;
    action: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        performedById: params.performedById,
        actorType: params.actorType ?? AuditActorType.PLATFORM_USER,
        onBehalfOfType: params.onBehalfOfType,
        onBehalfOfId: params.onBehalfOfId,
        action: params.action,
        metadata: params.metadata,
      },
    });
  }

  async listForTenant(actor: JwtAccessPayload, query: { action?: string }) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
    return this.prisma.auditLog.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(query.action?.trim() ? { action: query.action.trim() } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: {
        performedBy: {
          select: { id: true, displayName: true, email: true, phone: true, role: true },
        },
      },
    });
  }
}
