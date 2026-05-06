import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  JobApplicationStatus,
  PaymentMilestoneKey,
  PaymentMilestoneStatus,
  PlatformRole,
  Prisma,
  SeekerServiceStepKey,
  SeekerServiceStepStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyJobDto } from './dto/apply-job.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateJobDto } from './dto/update-job.dto';

const DRAFT = 'DRAFT';
const PUBLISHED = 'PUBLISHED';

@Injectable()
export class JobsService {
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

  private async syncServicePlanByApplicationStatus(params: {
    tenantId: string;
    seekerUserId: string;
    status: JobApplicationStatus;
  }) {
    const plan = await this.prisma.seekerServicePlan.findUnique({
      where: {
        tenantId_seekerUserId: {
          tenantId: params.tenantId,
          seekerUserId: params.seekerUserId,
        },
      },
      include: { steps: true, milestones: true },
    });
    if (!plan) return;

    const updates: Promise<unknown>[] = [];
    if (params.status === JobApplicationStatus.INTERVIEW) {
      const interviewStep = plan.steps.find((s) => s.key === SeekerServiceStepKey.INTERVIEW_CONFIRMATION);
      if (interviewStep && interviewStep.status === SeekerServiceStepStatus.LOCKED) {
        updates.push(
          this.prisma.seekerServiceStep.update({
            where: { id: interviewStep.id },
            data: { status: SeekerServiceStepStatus.NOT_STARTED },
          }),
        );
      }
    }

    if (params.status === JobApplicationStatus.OFFER) {
      const deposit = plan.milestones.find((m) => m.key === PaymentMilestoneKey.OFFER_DEPOSIT);
      if (deposit && deposit.status === PaymentMilestoneStatus.LOCKED) {
        updates.push(
          this.prisma.servicePaymentMilestone.update({
            where: { id: deposit.id },
            data: { status: PaymentMilestoneStatus.PAYABLE },
          }),
        );
      }
      const postOfferStep = plan.steps.find((s) => s.key === SeekerServiceStepKey.POST_OFFER_COACHING);
      if (postOfferStep && postOfferStep.status === SeekerServiceStepStatus.LOCKED) {
        updates.push(
          this.prisma.seekerServiceStep.update({
            where: { id: postOfferStep.id },
            data: { status: SeekerServiceStepStatus.NOT_STARTED },
          }),
        );
      }
    }

    if (updates.length) {
      await Promise.all(updates);
    }
  }

  /** 求职者/任意登录用户浏览已发布岗位 */
  async listPublished(actor: JwtAccessPayload) {
    return this.prisma.jobPosting.findMany({
      where: { tenantId: actor.tenantId, status: PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      include: {
        enterprise: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    });
  }

  async getPublishedById(actor: JwtAccessPayload, id: string) {
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, tenantId: actor.tenantId, status: PUBLISHED },
      include: {
        enterprise: { select: { id: true, name: true, contactEmail: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('岗位不存在或未发布');
    return job;
  }

  async apply(actor: JwtAccessPayload, jobId: string, dto: ApplyJobDto) {
    if (actor.role !== PlatformRole.JOB_SEEKER) {
      throw new ForbiddenException('仅求职者可投递');
    }
    const job = await this.prisma.jobPosting.findFirst({
      where: { id: jobId, tenantId: actor.tenantId, status: PUBLISHED },
    });
    if (!job) {
      throw new NotFoundException('岗位不存在或未发布');
    }
    try {
      const row = await this.prisma.jobApplication.create({
        data: {
          tenantId: actor.tenantId,
          jobPostingId: job.id,
          seekerUserId: actor.sub,
          status: JobApplicationStatus.SUBMITTED,
          pitch: dto.pitch?.trim() || null,
        },
      });
      await this.audit.log({
        tenantId: actor.tenantId,
        performedById: actor.sub,
        onBehalfOfType: 'USER',
        onBehalfOfId: actor.sub,
        action: 'JOB_APPLY',
        metadata: {
          applicationId: row.id,
          jobPostingId: job.id,
          enterpriseId: job.enterpriseId,
        },
      });
      return row;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('已投递该岗位');
      }
      throw e;
    }
  }

  async listApplicationsForJob(actor: JwtAccessPayload, jobId: string) {
    this.assertStaff(actor);
    const job = await this.prisma.jobPosting.findFirst({
      where: { id: jobId, tenantId: actor.tenantId },
    });
    if (!job) throw new NotFoundException('岗位不存在');
    return this.prisma.jobApplication.findMany({
      where: { jobPostingId: job.id, tenantId: actor.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        seeker: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateApplicationStatus(
    actor: JwtAccessPayload,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    this.assertStaff(actor);
    const app = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, tenantId: actor.tenantId },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            enterpriseId: true,
          },
        },
      },
    });
    if (!app) {
      throw new NotFoundException('投递记录不存在');
    }
    if (app.status === dto.status) {
      return app;
    }
    const updated = await this.prisma.jobApplication.update({
      where: { id: app.id },
      data: { status: dto.status },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            status: true,
            enterprise: { select: { id: true, name: true } },
          },
        },
        seeker: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: app.jobPosting.enterpriseId,
      action: 'JOB_APPLICATION_STATUS_UPDATE',
      metadata: {
        applicationId: app.id,
        jobPostingId: app.jobPostingId,
        seekerUserId: app.seekerUserId,
        from: app.status,
        to: dto.status,
        note: dto.note?.trim() || null,
      },
    });
    await this.notifications.create({
      tenantId: actor.tenantId,
      userId: app.seekerUserId,
      title: '投递状态已更新',
      body: `你投递的「${app.jobPosting.title}」状态已更新为 ${dto.status}`,
      category: 'JOB_APPLICATION',
      metadata: {
        applicationId: app.id,
        jobPostingId: app.jobPostingId,
        status: dto.status,
      },
    });
    await this.syncServicePlanByApplicationStatus({
      tenantId: actor.tenantId,
      seekerUserId: app.seekerUserId,
      status: dto.status,
    });
    return updated;
  }

  async list(actor: JwtAccessPayload, query: { status?: string; enterpriseId?: string }) {
    this.assertStaff(actor);
    return this.prisma.jobPosting.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.enterpriseId ? { enterpriseId: query.enterpriseId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        enterprise: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    });
  }

  async getById(actor: JwtAccessPayload, id: string) {
    this.assertStaff(actor);
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, tenantId: actor.tenantId },
      include: {
        enterprise: { select: { id: true, name: true, contactEmail: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('岗位不存在');
    return job;
  }

  async create(actor: JwtAccessPayload, dto: CreateJobDto) {
    this.assertStaff(actor);
    const ent = await this.prisma.enterprise.findFirst({
      where: { id: dto.enterpriseId, tenantId: actor.tenantId },
    });
    if (!ent) throw new NotFoundException('企业不存在');
    const job = await this.prisma.jobPosting.create({
      data: {
        tenantId: actor.tenantId,
        enterpriseId: ent.id,
        title: dto.title,
        jdMarkdown: dto.jdMarkdown,
        status: DRAFT,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: ent.id,
      action: 'JOB_CREATE',
      metadata: { jobId: job.id, title: job.title },
    });
    return job;
  }

  async update(actor: JwtAccessPayload, id: string, dto: UpdateJobDto) {
    this.assertStaff(actor);
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    if (!job) throw new NotFoundException('岗位不存在');
    if (job.status !== DRAFT) {
      throw new BadRequestException('仅草稿状态可编辑');
    }
    const updated = await this.prisma.jobPosting.update({
      where: { id: job.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.jdMarkdown !== undefined ? { jdMarkdown: dto.jdMarkdown } : {}),
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: job.enterpriseId,
      action: 'JOB_UPDATE',
      metadata: { jobId: job.id },
    });
    return updated;
  }

  async publish(actor: JwtAccessPayload, id: string) {
    this.assertStaff(actor);
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    if (!job) throw new NotFoundException('岗位不存在');
    if (job.status === PUBLISHED) {
      return job;
    }
    if (job.status !== DRAFT) {
      throw new BadRequestException('当前状态不可发布');
    }
    const updated = await this.prisma.jobPosting.update({
      where: { id: job.id },
      data: { status: PUBLISHED, publishedAt: new Date() },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ENTERPRISE',
      onBehalfOfId: job.enterpriseId,
      action: 'JOB_PUBLISH',
      metadata: { jobId: job.id, title: job.title },
    });
    return updated;
  }
}
