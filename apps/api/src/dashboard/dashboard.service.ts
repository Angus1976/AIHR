import { ForbiddenException, Injectable } from '@nestjs/common';
import { JobApplicationStatus, OrderStatus, PartnerApplicationStatus, PlatformRole, RefundRequestStatus } from '@prisma/client';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  async summary(actor: JwtAccessPayload) {
    this.assertStaff(actor);
    const tenantId = actor.tenantId;
    const [
      jobsTotal,
      jobsPublished,
      applicationsTotal,
      applicationsByStatus,
      ordersPaid,
      revenue,
      refundPending,
      partnersPending,
      contractsSigned,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.jobPosting.count({ where: { tenantId } }),
      this.prisma.jobPosting.count({ where: { tenantId, status: 'PUBLISHED' } }),
      this.prisma.jobApplication.count({ where: { tenantId } }),
      this.prisma.jobApplication.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { _all: true },
      }),
      this.prisma.order.count({ where: { tenantId, status: OrderStatus.PAID } }),
      this.prisma.order.aggregate({
        where: { tenantId, status: OrderStatus.PAID },
        _sum: { amountFen: true },
      }),
      this.prisma.refundRequest.count({
        where: { tenantId, status: { in: [RefundRequestStatus.SUBMITTED, RefundRequestStatus.APPROVED] } },
      }),
      this.prisma.partnerApplication.count({
        where: { tenantId, status: { in: [PartnerApplicationStatus.SUBMITTED, PartnerApplicationStatus.REVIEWING] } },
      }),
      this.prisma.contractAgreement.count({ where: { tenantId, status: 'SIGNED' } }),
      this.prisma.userNotification.count({ where: { tenantId, userId: actor.sub, readAt: null } }),
    ]);

    const byStatus = Object.fromEntries(
      Object.values(JobApplicationStatus).map((status) => [status, 0]),
    ) as Record<JobApplicationStatus, number>;
    for (const row of applicationsByStatus) {
      byStatus[row.status] = row._count._all;
    }

    return {
      jobs: { total: jobsTotal, published: jobsPublished },
      applications: { total: applicationsTotal, byStatus },
      orders: { paid: ordersPaid, revenueFen: revenue._sum.amountFen ?? 0 },
      refunds: { pending: refundPending },
      partners: { pending: partnersPending },
      contracts: { signed: contractsSigned },
      notifications: { unread: unreadNotifications },
    };
  }
}
