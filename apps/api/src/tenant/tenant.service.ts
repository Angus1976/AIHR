import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformRole, Tenant } from '@prisma/client';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      throw new NotFoundException(`租户不存在: ${slug}`);
    }
    return tenant;
  }

  async findByWxMiniAppId(appId: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { wxMiniAppId: appId } });
  }

  async resolveTenant(opts: {
    tenantSlug?: string;
    wxAppIdFromConfig?: string;
  }): Promise<Tenant> {
    if (opts.wxAppIdFromConfig) {
      const byApp = await this.findByWxMiniAppId(opts.wxAppIdFromConfig);
      if (byApp) return byApp;
    }
    const slug =
      opts.tenantSlug ??
      process.env.DEFAULT_TENANT_SLUG ??
      'default';
    return this.findBySlug(slug);
  }

  async current(actor: JwtAccessPayload): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: actor.tenantId } });
    if (!tenant) {
      throw new NotFoundException('当前租户不存在');
    }
    return tenant;
  }

  async updateCurrent(actor: JwtAccessPayload, dto: UpdateTenantDto): Promise<Tenant> {
    if (actor.role !== PlatformRole.ADMIN) {
      throw new ForbiddenException('仅管理员可更新租户配置');
    }
    return this.prisma.tenant.update({
      where: { id: actor.tenantId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl.trim() || null } : {}),
        ...(dto.primaryColor !== undefined ? { primaryColor: dto.primaryColor.trim() || null } : {}),
        ...(dto.accentColor !== undefined ? { accentColor: dto.accentColor.trim() || null } : {}),
        ...(dto.welcomeText !== undefined ? { welcomeText: dto.welcomeText.trim() || null } : {}),
      },
    });
  }
}
