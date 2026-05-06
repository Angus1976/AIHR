import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertServiceProductDto } from './dto/upsert-service-product.dto';

@Injectable()
export class CommerceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  async listProducts(actor: JwtAccessPayload, audience?: string) {
    const staff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    return this.prisma.serviceProduct.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(audience?.trim() ? { audience: audience.trim() } : {}),
        ...(staff ? {} : { enabled: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async upsertProduct(actor: JwtAccessPayload, dto: UpsertServiceProductDto) {
    this.assertStaff(actor);
    const code = dto.code.trim();
    const row = await this.prisma.serviceProduct.upsert({
      where: { tenantId_code: { tenantId: actor.tenantId, code } },
      create: {
        tenantId: actor.tenantId,
        code,
        name: dto.name.trim(),
        audience: dto.audience.trim(),
        orderKind: dto.orderKind,
        amountFen: dto.amountFen,
        description: dto.description?.trim() || null,
        sortOrder: dto.sortOrder ?? 100,
        enabled: dto.enabled ?? true,
      },
      update: {
        name: dto.name.trim(),
        audience: dto.audience.trim(),
        orderKind: dto.orderKind,
        amountFen: dto.amountFen,
        description: dto.description?.trim() || null,
        sortOrder: dto.sortOrder ?? 100,
        enabled: dto.enabled ?? true,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'TENANT',
      onBehalfOfId: actor.tenantId,
      action: 'SERVICE_PRODUCT_UPSERT',
      metadata: { productId: row.id, code: row.code, amountFen: row.amountFen },
    });
    return row;
  }

  async getEnabledProduct(actor: JwtAccessPayload, id: string) {
    const row = await this.prisma.serviceProduct.findFirst({
      where: { id, tenantId: actor.tenantId, enabled: true },
    });
    if (!row) {
      throw new NotFoundException('服务产品不存在或未启用');
    }
    return row;
  }
}
