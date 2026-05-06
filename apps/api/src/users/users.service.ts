import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  private assertAdmin(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN) {
      throw new ForbiddenException('仅管理员可维护账号');
    }
  }

  async list(actor: JwtAccessPayload, role?: PlatformRole) {
    this.assertStaff(actor);
    return this.prisma.user.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(role ? { role } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 300,
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        jobSeekerProfile: {
          select: {
            headline: true,
            skillsText: true,
            updatedAt: true,
          },
        },
        _count: { select: { jobApplications: true, orders: true } },
      },
    });
  }

  async create(actor: JwtAccessPayload, dto: CreateUserDto) {
    this.assertAdmin(actor);
    if (!dto.email?.trim() && !dto.phone?.trim()) {
      throw new BadRequestException('邮箱和手机至少填写一个');
    }
    if (
      (dto.role === PlatformRole.ADMIN || dto.role === PlatformRole.TEACHER) &&
      !dto.password?.trim()
    ) {
      throw new BadRequestException('管理员/老师账号必须设置密码');
    }
    try {
      const row = await this.prisma.user.create({
        data: {
          tenantId: actor.tenantId,
          displayName: dto.displayName.trim(),
          email: dto.email?.trim().toLowerCase() || null,
          phone: dto.phone?.trim() || null,
          role: dto.role,
          passwordHash: dto.password ? await bcrypt.hash(dto.password, 10) : null,
        },
        select: {
          id: true,
          displayName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      await this.audit.log({
        tenantId: actor.tenantId,
        performedById: actor.sub,
        onBehalfOfType: 'USER',
        onBehalfOfId: row.id,
        action: 'USER_CREATE',
        metadata: { userId: row.id, role: row.role },
      });
      return row;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('邮箱或手机已被占用');
      }
      throw e;
    }
  }

  async update(actor: JwtAccessPayload, userId: string, dto: UpdateUserDto) {
    this.assertAdmin(actor);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: actor.tenantId },
    });
    if (!user) throw new NotFoundException('用户不存在');
    try {
      const row = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(dto.displayName !== undefined ? { displayName: dto.displayName.trim() } : {}),
          ...(dto.email !== undefined
            ? { email: dto.email === null ? null : dto.email.trim().toLowerCase() || null }
            : {}),
          ...(dto.phone !== undefined
            ? { phone: dto.phone === null ? null : dto.phone.trim() || null }
            : {}),
          ...(dto.role !== undefined ? { role: dto.role } : {}),
          ...(dto.password ? { passwordHash: await bcrypt.hash(dto.password, 10) } : {}),
        },
        select: {
          id: true,
          displayName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      await this.audit.log({
        tenantId: actor.tenantId,
        performedById: actor.sub,
        onBehalfOfType: 'USER',
        onBehalfOfId: row.id,
        action: 'USER_UPDATE',
        metadata: { userId: row.id, role: row.role },
      });
      return row;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('邮箱或手机已被占用');
      }
      throw e;
    }
  }

  async getProfile(actor: JwtAccessPayload, userId: string) {
    this.assertStaff(actor);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: actor.tenantId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role !== PlatformRole.JOB_SEEKER) {
      throw new BadRequestException('仅求职者支持档案');
    }
    return this.prisma.jobSeekerProfile.findUnique({
      where: { userId: user.id },
    });
  }

  async upsertProfile(
    actor: JwtAccessPayload,
    userId: string,
    dto: UpdateUserProfileDto,
  ) {
    this.assertStaff(actor);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: actor.tenantId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role !== PlatformRole.JOB_SEEKER) {
      throw new BadRequestException('仅求职者支持档案');
    }
    const row = await this.prisma.jobSeekerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tenantId: actor.tenantId,
        headline: dto.headline?.trim() || null,
        skillsText: dto.skillsText?.trim() || null,
        resumeMarkdown: dto.resumeMarkdown?.trim() || null,
      },
      update: {
        headline: dto.headline !== undefined ? dto.headline.trim() || null : undefined,
        skillsText: dto.skillsText !== undefined ? dto.skillsText.trim() || null : undefined,
        resumeMarkdown:
          dto.resumeMarkdown !== undefined ? dto.resumeMarkdown.trim() || null : undefined,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'USER',
      onBehalfOfId: user.id,
      action: 'JOB_SEEKER_PROFILE_UPSERT_BY_STAFF',
      metadata: { userId: user.id, profileId: row.id },
    });
    return row;
  }
}
