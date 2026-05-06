import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlatformRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { WechatService } from '../wechat/wechat.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { WechatMiniLoginDto } from './dto/wechat-mini-login.dto';
import { JwtAccessPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
    private readonly wechat: WechatService,
    private readonly jwt: JwtService,
  ) {}

  private signAccess(user: {
    id: string;
    tenantId: string;
    role: PlatformRole;
  }) {
    const payload: JwtAccessPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };
    return {
      accessToken: this.jwt.sign(payload),
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    };
  }

  async loginWeChatMini(dto: WechatMiniLoginDto) {
    const appId = process.env.WECHAT_MINI_APP_ID;
    const secret = process.env.WECHAT_MINI_APP_SECRET;
    if (!appId || !secret) {
      throw new UnprocessableEntityException(
        '服务端未配置 WECHAT_MINI_APP_ID / WECHAT_MINI_APP_SECRET',
      );
    }
    const tenant = await this.tenantService.resolveTenant({
      tenantSlug: dto.tenantSlug,
      wxAppIdFromConfig: appId,
    });
    if (tenant.wxMiniAppId && tenant.wxMiniAppId !== appId) {
      throw new UnauthorizedException('当前小程序与租户绑定不一致');
    }
    const session = await this.wechat.code2Session(appId, secret, dto.code);
    const existing = await this.prisma.wxMiniUser.findUnique({
      where: {
        tenantId_openid: { tenantId: tenant.id, openid: session.openid },
      },
      include: { user: true },
    });
    if (existing) {
      await this.prisma.wxMiniUser.update({
        where: { id: existing.id },
        data: { sessionKey: null, unionid: session.unionid ?? existing.unionid },
      });
      return {
        ...this.signAccess(existing.user),
        user: { id: existing.user.id, displayName: existing.user.displayName },
      };
    }
    const displayName = `求职者·${session.openid.slice(-4)}`;
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        displayName,
        role: PlatformRole.JOB_SEEKER,
      },
    });
    await this.prisma.wxMiniUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        openid: session.openid,
        unionid: session.unionid,
        sessionKey: null,
      },
    });
    return {
      ...this.signAccess(user),
      user: { id: user.id, displayName: user.displayName },
    };
  }

  async loginAdmin(dto: AdminLoginDto) {
    const slug = process.env.DEFAULT_TENANT_SLUG ?? 'default';
    const tenant = await this.tenantService.findBySlug(slug);
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: dto.email.toLowerCase(),
        role: { in: [PlatformRole.ADMIN, PlatformRole.TEACHER] },
      },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('账号或密码错误');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return {
      ...this.signAccess(user),
      user: { id: user.id, displayName: user.displayName, role: user.role },
    };
  }

  async loginDev(dto: DevLoginDto) {
    if (process.env.LOCAL_SIMULATOR_ENABLED !== 'true') {
      throw new UnauthorizedException('本地模拟登录未启用');
    }
    const slug = process.env.DEFAULT_TENANT_SLUG ?? 'default';
    const tenant = await this.tenantService.findBySlug(slug);
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: dto.role,
        ...(dto.email?.trim() ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.phone?.trim() ? { phone: dto.phone.trim() } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (!user) {
      throw new UnauthorizedException('未找到该角色的模拟用户，请先运行 npm run prisma:demo');
    }
    return {
      ...this.signAccess(user),
      user: {
        id: user.id,
        displayName: user.displayName,
        role: user.role,
        email: user.email,
        phone: user.phone,
      },
    };
  }
}
