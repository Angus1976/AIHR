import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InterviewOpportunityStatus, JobApplicationStatus, PlatformRole, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewOpportunityDto } from './dto/create-interview-opportunity.dto';
import { RespondInterviewOpportunityDto } from './dto/respond-interview-opportunity.dto';

@Injectable()
export class InterviewOpportunitiesService {
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

  private includeAll() {
    return {
      jobPosting: { select: { id: true, title: true, status: true, enterprise: { select: { id: true, name: true } } } },
      seeker: { select: { id: true, displayName: true, phone: true, email: true } },
      pushedBy: { select: { id: true, displayName: true, role: true } },
    };
  }

  async create(actor: JwtAccessPayload, dto: CreateInterviewOpportunityDto) {
    this.assertStaff(actor);
    const job = await this.prisma.jobPosting.findFirst({
      where: { id: dto.jobPostingId, tenantId: actor.tenantId },
      include: { enterprise: { select: { id: true, name: true } } },
    });
    if (!job) throw new NotFoundException('岗位不存在');
    const seeker = await this.prisma.user.findFirst({
      where: { id: dto.seekerUserId, tenantId: actor.tenantId, role: PlatformRole.JOB_SEEKER },
    });
    if (!seeker) throw new NotFoundException('求职者不存在');

    try {
      const row = await this.prisma.interviewOpportunity.upsert({
        where: { jobPostingId_seekerUserId: { jobPostingId: job.id, seekerUserId: seeker.id } },
        create: {
          tenantId: actor.tenantId,
          jobPostingId: job.id,
          seekerUserId: seeker.id,
          pushedById: actor.sub,
          scheduledAt: dto.scheduledAt ?? null,
          note: dto.note?.trim() || null,
        },
        update: {
          status: InterviewOpportunityStatus.PENDING,
          pushedById: actor.sub,
          scheduledAt: dto.scheduledAt ?? null,
          note: dto.note?.trim() || null,
          respondedAt: null,
        },
        include: this.includeAll(),
      });

      await this.prisma.jobApplication.upsert({
        where: { jobPostingId_seekerUserId: { jobPostingId: job.id, seekerUserId: seeker.id } },
        create: {
          tenantId: actor.tenantId,
          jobPostingId: job.id,
          seekerUserId: seeker.id,
          status: JobApplicationStatus.INTERVIEW,
          pitch: '平台推送面试机会',
        },
        update: { status: JobApplicationStatus.INTERVIEW },
      });

      await this.notifications.create({
        tenantId: actor.tenantId,
        userId: seeker.id,
        title: '新的面试机会待确认',
        body: `${job.enterprise.name} · ${job.title} 已推送给你，请确认是否参加。`,
        category: 'INTERVIEW_OPPORTUNITY',
        metadata: { opportunityId: row.id, jobPostingId: job.id },
      });
      await this.audit.log({
        tenantId: actor.tenantId,
        performedById: actor.sub,
        onBehalfOfType: 'USER',
        onBehalfOfId: seeker.id,
        action: 'INTERVIEW_OPPORTUNITY_PUSH',
        metadata: { opportunityId: row.id, jobPostingId: job.id, seekerUserId: seeker.id },
      });
      return row;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('该面试机会已存在');
      }
      throw e;
    }
  }

  async listForStaff(actor: JwtAccessPayload) {
    this.assertStaff(actor);
    return this.prisma.interviewOpportunity.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: this.includeAll(),
    });
  }

  async listMine(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.JOB_SEEKER) {
      throw new ForbiddenException('仅求职者可查看自己的面试机会');
    }
    return this.prisma.interviewOpportunity.findMany({
      where: { tenantId: actor.tenantId, seekerUserId: actor.sub },
      orderBy: { createdAt: 'desc' },
      include: this.includeAll(),
    });
  }

  async respond(actor: JwtAccessPayload, id: string, dto: RespondInterviewOpportunityDto) {
    if (actor.role !== PlatformRole.JOB_SEEKER) {
      throw new ForbiddenException('仅求职者可确认面试机会');
    }
    if (
      dto.status !== InterviewOpportunityStatus.ACCEPTED &&
      dto.status !== InterviewOpportunityStatus.DECLINED
    ) {
      throw new BadRequestException('只能选择参加或拒绝');
    }
    const row = await this.prisma.interviewOpportunity.findFirst({
      where: { id, tenantId: actor.tenantId, seekerUserId: actor.sub },
      include: this.includeAll(),
    });
    if (!row) throw new NotFoundException('面试机会不存在');
    const updated = await this.prisma.interviewOpportunity.update({
      where: { id: row.id },
      data: {
        status: dto.status,
        note: dto.note?.trim() || row.note,
        respondedAt: new Date(),
      },
      include: this.includeAll(),
    });
    if (dto.status === InterviewOpportunityStatus.DECLINED) {
      await this.prisma.jobApplication.updateMany({
        where: { tenantId: actor.tenantId, jobPostingId: row.jobPostingId, seekerUserId: actor.sub },
        data: { status: JobApplicationStatus.WITHDRAWN },
      });
    }
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'INTERVIEW_OPPORTUNITY',
      onBehalfOfId: row.id,
      action: 'INTERVIEW_OPPORTUNITY_RESPOND',
      metadata: { opportunityId: row.id, status: dto.status, note: dto.note ?? null },
    });
    return updated;
  }
}
