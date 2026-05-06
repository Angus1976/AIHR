import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    tenantId: string;
    userId: string;
    title: string;
    body: string;
    category: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.userNotification.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        title: params.title,
        body: params.body,
        category: params.category,
        metadata: params.metadata,
      },
    });
  }

  async listMine(actor: JwtAccessPayload) {
    return this.prisma.userNotification.findMany({
      where: { tenantId: actor.tenantId, userId: actor.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async unreadCount(actor: JwtAccessPayload) {
    const count = await this.prisma.userNotification.count({
      where: { tenantId: actor.tenantId, userId: actor.sub, readAt: null },
    });
    return { count };
  }

  async markRead(actor: JwtAccessPayload, id: string) {
    const row = await this.prisma.userNotification.findFirst({
      where: { id, tenantId: actor.tenantId, userId: actor.sub },
    });
    if (!row) {
      throw new NotFoundException('通知不存在');
    }
    if (row.readAt) return row;
    return this.prisma.userNotification.update({
      where: { id: row.id },
      data: { readAt: new Date() },
    });
  }
}
