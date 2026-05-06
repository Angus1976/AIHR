import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  InterviewOpportunityStatus,
  JobApplicationStatus,
  PaymentMilestoneKey,
  PaymentMilestoneStatus,
  PlatformRole,
  SeekerServiceStepKey,
  SeekerServiceStepStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { LlmRouterService } from '../integrations/llm-router.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { EnsureServicePlanDto } from './dto/ensure-service-plan.dto';
import { FeedbackServiceStepDto } from './dto/feedback-service-step.dto';
import { RequestServiceStepDto } from './dto/request-service-step.dto';
import { UpdatePaymentMilestoneDto } from './dto/update-payment-milestone.dto';
import { UpdateServiceStepDto } from './dto/update-service-step.dto';
import { DEFAULT_PAYMENT_MILESTONES, DEFAULT_SERVICE_STEPS } from './service-plan-defaults';

@Injectable()
export class ServicePlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly llm: LlmRouterService,
    private readonly notifications: NotificationsService,
  ) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  private includePlan() {
    return {
      seeker: { select: { id: true, displayName: true, phone: true, email: true } },
      steps: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' as const },
            take: 30,
          },
        },
      },
      milestones: { orderBy: { sortOrder: 'asc' as const }, include: { order: true } },
    };
  }

  async ensureMine(actor: JwtAccessPayload, dto: EnsureServicePlanDto) {
    if (actor.role !== PlatformRole.JOB_SEEKER) throw new ForbiddenException();
    return this.ensureForUser(actor, actor.sub, dto);
  }

  private async buildServiceStepContextBlock(params: {
    tenantId: string;
    seekerUserId: string;
    stepKey: SeekerServiceStepKey;
    planSummary: string | null;
    checklist: unknown;
  }): Promise<string> {
    const lines: string[] = [];
    const cl = params.checklist;
    if (Array.isArray(cl) && cl.length && cl.every((x) => typeof x === 'string')) {
      lines.push('【本环节交付清单（PRD）】', ...(cl as string[]).map((c) => `- ${c}`));
    }

    const apps = await this.prisma.jobApplication.findMany({
      where: { tenantId: params.tenantId, seekerUserId: params.seekerUserId },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: { jobPosting: { select: { title: true } } },
    });
    if (apps.length) {
      const statusLabel: Record<JobApplicationStatus, string> = {
        [JobApplicationStatus.SUBMITTED]: '已投递',
        [JobApplicationStatus.REVIEWING]: '评估中',
        [JobApplicationStatus.INTERVIEW]: '面试中',
        [JobApplicationStatus.OFFER]: '已获 offer',
        [JobApplicationStatus.REJECTED]: '未通过',
        [JobApplicationStatus.WITHDRAWN]: '已撤回',
      };
      lines.push(
        '【投递与岗位进展】',
        ...apps.map((a) => {
          const note = a.pitch?.trim() ? ` 补充：${a.pitch.trim().slice(0, 120)}` : '';
          return `- 《${a.jobPosting.title}》：${statusLabel[a.status]}${note}`;
        }),
      );
    } else {
      lines.push('【投递与岗位进展】暂无投递，可结合职前/简历环节引导候选人补充目标与材料。');
    }

    if (params.stepKey === SeekerServiceStepKey.INTERVIEW_CONFIRMATION) {
      const whereBase = { tenantId: params.tenantId, seekerUserId: params.seekerUserId };
      const [pending, accepted, declined] = await Promise.all([
        this.prisma.interviewOpportunity.count({
          where: { ...whereBase, status: InterviewOpportunityStatus.PENDING },
        }),
        this.prisma.interviewOpportunity.count({
          where: { ...whereBase, status: InterviewOpportunityStatus.ACCEPTED },
        }),
        this.prisma.interviewOpportunity.count({
          where: { ...whereBase, status: InterviewOpportunityStatus.DECLINED },
        }),
      ]);
      lines.push(
        '【平台面试机会】',
        `- 待处理 ${pending} 条，已确认参加 ${accepted} 条，已拒绝 ${declined} 条。请帮助候选人梳理是否确认/拒绝及沟通要点。`,
      );
    }

    if (params.stepKey === SeekerServiceStepKey.INTERVIEW_COACHING) {
      const sessions = await this.prisma.mockInterviewSession.findMany({
        where: { tenantId: params.tenantId, seekerUserId: params.seekerUserId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });
      if (sessions.length) {
        lines.push(
          '【腾讯会议·模拟面试（与求职流程-面试准备对齐）】',
          ...sessions.map(
            (s) =>
              `- 状态：${s.status}；主题：${s.subject || '—'}；会议号/ID：${s.meetingId || '—'}；会中能力说明：${(s.robotSideNote || '—').slice(0, 400)}`,
          ),
        );
      } else {
        lines.push(
          '【腾讯会议·模拟面试】平台尚未生成会议记录。通信侧将使用腾讯会议；会中引导、记录与复盘说明通过会议侧能力承载。可引导用户先在小程序完成预约。',
        );
      }
    }

    if (params.stepKey === SeekerServiceStepKey.POST_OFFER_COACHING) {
      const offerApp = await this.prisma.jobApplication.findFirst({
        where: {
          tenantId: params.tenantId,
          seekerUserId: params.seekerUserId,
          status: JobApplicationStatus.OFFER,
        },
        orderBy: { updatedAt: 'desc' },
        include: { jobPosting: { select: { title: true } } },
      });
      lines.push(
        offerApp
          ? `【当前 offer 关联岗位】${offerApp.jobPosting.title}（请围绕试用期适应给建议）`
          : '【当前 offer 关联岗位】尚未在系统中标记 offer，可泛化输出试用期建议。',
      );
    }

    if (params.planSummary?.trim()) {
      lines.push('【服务计划摘要】', params.planSummary.trim());
    }

    return lines.join('\n');
  }

  async ensureForUser(actor: JwtAccessPayload, seekerUserId: string, dto: EnsureServicePlanDto) {
    if (actor.role === PlatformRole.JOB_SEEKER) {
      if (actor.sub !== seekerUserId) throw new ForbiddenException();
    } else {
      this.assertStaff(actor);
    }
    const user = await this.prisma.user.findFirst({
      where: { id: seekerUserId, tenantId: actor.tenantId },
    });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role !== PlatformRole.JOB_SEEKER) {
      throw new BadRequestException('仅求职者可创建服务计划');
    }

    const plan = await this.prisma.seekerServicePlan.upsert({
      where: { tenantId_seekerUserId: { tenantId: actor.tenantId, seekerUserId } },
      create: {
        tenantId: actor.tenantId,
        seekerUserId,
        targetRole: dto.targetRole?.trim() || null,
        salaryMinFen: dto.salaryMinFen,
        salaryMaxFen: dto.salaryMaxFen,
        summary: dto.summary?.trim() || null,
      },
      update: {
        targetRole: dto.targetRole !== undefined ? dto.targetRole.trim() || null : undefined,
        salaryMinFen: dto.salaryMinFen,
        salaryMaxFen: dto.salaryMaxFen,
        summary: dto.summary !== undefined ? dto.summary.trim() || null : undefined,
      },
    });

    await Promise.all([
      ...DEFAULT_SERVICE_STEPS.map((s) =>
        this.prisma.seekerServiceStep.upsert({
          where: { planId_key: { planId: plan.id, key: s.key } },
          create: { planId: plan.id, ...s },
          update: {
            title: s.title,
            valueProposition: s.valueProposition,
            sortOrder: s.sortOrder,
            checklist: s.checklist,
          },
        }),
      ),
      ...DEFAULT_PAYMENT_MILESTONES.map((m) =>
        this.prisma.servicePaymentMilestone.upsert({
          where: { planId_key: { planId: plan.id, key: m.key } },
          create: { planId: plan.id, ...m },
          update: {
            title: m.title,
            triggerText: m.triggerText,
            sortOrder: m.sortOrder,
          },
        }),
      ),
    ]);

    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'USER',
      onBehalfOfId: seekerUserId,
      action: 'SEEKER_SERVICE_PLAN_ENSURE',
      metadata: { planId: plan.id },
    });

    return this.getById(actor, plan.id);
  }

  async getMine(actor: JwtAccessPayload) {
    const plan = await this.prisma.seekerServicePlan.findUnique({
      where: { tenantId_seekerUserId: { tenantId: actor.tenantId, seekerUserId: actor.sub } },
      include: this.includePlan(),
    });
    return plan;
  }

  async getForUser(actor: JwtAccessPayload, seekerUserId: string) {
    this.assertStaff(actor);
    return this.prisma.seekerServicePlan.findUnique({
      where: { tenantId_seekerUserId: { tenantId: actor.tenantId, seekerUserId } },
      include: this.includePlan(),
    });
  }

  async list(actor: JwtAccessPayload) {
    this.assertStaff(actor);
    return this.prisma.seekerServicePlan.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: this.includePlan(),
    });
  }

  async getById(actor: JwtAccessPayload, planId: string) {
    const plan = await this.prisma.seekerServicePlan.findFirst({
      where: { id: planId, tenantId: actor.tenantId },
      include: this.includePlan(),
    });
    if (!plan) throw new NotFoundException('服务计划不存在');
    if (actor.role === PlatformRole.JOB_SEEKER && plan.seekerUserId !== actor.sub) {
      throw new ForbiddenException();
    }
    if (
      actor.role !== PlatformRole.JOB_SEEKER &&
      actor.role !== PlatformRole.ADMIN &&
      actor.role !== PlatformRole.TEACHER
    ) {
      throw new ForbiddenException();
    }
    return plan;
  }

  async updateStep(actor: JwtAccessPayload, planId: string, stepId: string, dto: UpdateServiceStepDto) {
    this.assertStaff(actor);
    const plan = await this.getById(actor, planId);
    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('服务环节不存在');
    await this.prisma.seekerServiceStep.update({
      where: { id: step.id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.providerType !== undefined ? { providerType: dto.providerType } : {}),
        ...(dto.deliverableSummary !== undefined ? { deliverableSummary: dto.deliverableSummary.trim() || null } : {}),
        ...(dto.partnerOrgName !== undefined ? { partnerOrgName: dto.partnerOrgName.trim() || null } : {}),
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'SEEKER_SERVICE_PLAN',
      onBehalfOfId: plan.id,
      action: 'SEEKER_SERVICE_STEP_UPDATE',
      metadata: { stepId: step.id, key: step.key, status: dto.status ?? step.status },
    });
    return this.getById(actor, plan.id);
  }

  async updateMilestone(actor: JwtAccessPayload, planId: string, milestoneId: string, dto: UpdatePaymentMilestoneDto) {
    this.assertStaff(actor);
    const plan = await this.getById(actor, planId);
    const milestone = plan.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new NotFoundException('付款节点不存在');
    await this.prisma.servicePaymentMilestone.update({
      where: { id: milestone.id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.amountFen !== undefined ? { amountFen: dto.amountFen } : {}),
        ...(dto.triggerText !== undefined ? { triggerText: dto.triggerText.trim() } : {}),
        ...(dto.orderId !== undefined ? { orderId: dto.orderId.trim() || null } : {}),
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'SEEKER_SERVICE_PLAN',
      onBehalfOfId: plan.id,
      action: 'SERVICE_PAYMENT_MILESTONE_UPDATE',
      metadata: { milestoneId: milestone.id, key: milestone.key, status: dto.status ?? milestone.status },
    });
    return this.getById(actor, plan.id);
  }

  async requestStepService(
    actor: JwtAccessPayload,
    planId: string,
    stepId: string,
    dto: RequestServiceStepDto,
  ) {
    const plan = await this.getById(actor, planId);
    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('服务环节不存在');
    const isOwner = actor.role === PlatformRole.JOB_SEEKER && plan.seekerUserId === actor.sub;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException();
    if (step.status === SeekerServiceStepStatus.LOCKED) {
      throw new BadRequestException('该服务环节尚未解锁');
    }

    const promptKey = `service_step_${step.key}`;
    const prompt = await this.prisma.aiPromptTemplate.findUnique({
      where: { tenantId_key: { tenantId: actor.tenantId, key: promptKey } },
    });
    const profile = await this.prisma.jobSeekerProfile.findUnique({
      where: { userId: plan.seekerUserId },
    });
    const systemPrompt =
      prompt?.body ??
      `请以职AI通就业服务口吻，围绕「${step.title}」给出简洁、可执行、合规的服务建议。不要向求职者说明建议由 AI、机器人、模型、真人专家或老师提供，统一使用“平台”“服务团队”“服务建议”等中性表达。`;
    const extraBlock = await this.buildServiceStepContextBlock({
      tenantId: actor.tenantId,
      seekerUserId: plan.seekerUserId,
      stepKey: step.key,
      planSummary: plan.summary,
      checklist: step.checklist,
    });
    const context = [
      `服务环节：${step.title}`,
      `服务价值说明：${step.valueProposition}`,
      `目标岗位：${plan.targetRole ?? '未确认'}`,
      `期望薪资区间（分）：${plan.salaryMinFen ?? '—'} - ${plan.salaryMaxFen ?? '—'}`,
      `候选人一句话亮点：${profile?.headline ?? '未填写'}`,
      `技能关键词：${profile?.skillsText ?? '未填写'}`,
      `简历/经历摘要（Markdown）：${profile?.resumeMarkdown ?? '未填写'}`,
      extraBlock,
      `用户本环节补充说明：${dto.inputText?.trim() || '无'}`,
    ].join('\n\n');

    const result = await this.llm.complete({
      tenantId: actor.tenantId,
      scenario: 'service_step',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context },
      ],
    });

    const interaction = await this.prisma.serviceStepInteraction.create({
      data: {
        tenantId: actor.tenantId,
        stepId: step.id,
        requestedById: actor.sub,
        promptKey,
        inputText: dto.inputText?.trim() || null,
        outputText: result.text,
        vendor: result.vendor,
        modelName: result.modelName ?? null,
        routeId: result.routeId ?? null,
      },
    });

    await this.prisma.seekerServiceStep.update({
      where: { id: step.id },
      data: {
        status:
          step.status === SeekerServiceStepStatus.NOT_STARTED ||
          step.status === SeekerServiceStepStatus.IN_PROGRESS
            ? SeekerServiceStepStatus.DELIVERED
            : step.status,
        deliverableSummary: result.text.slice(0, 1000),
      },
    });

    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'SEEKER_SERVICE_PLAN',
      onBehalfOfId: plan.id,
      action: 'SERVICE_STEP_REQUEST',
      metadata: { stepId: step.id, key: step.key, promptKey, interactionId: interaction.id },
    });

    if (isStaff && plan.seekerUserId !== actor.sub) {
      await this.notifications.create({
        tenantId: actor.tenantId,
        userId: plan.seekerUserId,
        title: `${step.title}服务已更新`,
        body: '平台已更新新的服务建议，请在服务计划中查看。',
        category: 'SERVICE_PLAN',
        metadata: { planId: plan.id, stepId: step.id, interactionId: interaction.id },
      });
    }

    return {
      interaction,
      plan: await this.getById(actor, plan.id),
    };
  }

  async confirmStep(actor: JwtAccessPayload, planId: string, stepId: string) {
    const plan = await this.getById(actor, planId);
    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('服务环节不存在');
    const isOwner = actor.role === PlatformRole.JOB_SEEKER && plan.seekerUserId === actor.sub;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException();
    if (step.status === SeekerServiceStepStatus.LOCKED) {
      throw new BadRequestException('该服务环节尚未解锁');
    }
    if (
      step.status !== SeekerServiceStepStatus.DELIVERED &&
      step.status !== SeekerServiceStepStatus.CONFIRMED
    ) {
      throw new BadRequestException('请先获取并交付该环节服务建议');
    }

    await this.prisma.seekerServiceStep.update({
      where: { id: step.id },
      data: { status: SeekerServiceStepStatus.CONFIRMED },
    });

    const next = plan.steps
      .filter((s) => s.sortOrder > step.sortOrder)
      .sort((a, b) => a.sortOrder - b.sortOrder)[0];
    if (next?.status === SeekerServiceStepStatus.LOCKED) {
      await this.prisma.seekerServiceStep.update({
        where: { id: next.id },
        data: { status: SeekerServiceStepStatus.NOT_STARTED },
      });
    }

    if (step.key === SeekerServiceStepKey.POST_OFFER_COACHING) {
      const month2 = plan.milestones.find((m) => m.key === PaymentMilestoneKey.MONTH_2_BALANCE);
      if (month2?.status === PaymentMilestoneStatus.LOCKED) {
        await this.prisma.servicePaymentMilestone.update({
          where: { id: month2.id },
          data: { status: PaymentMilestoneStatus.PAYABLE },
        });
      }
    }

    if (step.key === SeekerServiceStepKey.POST_CONVERSION_PLANNING) {
      const renewal = plan.milestones.find((m) => m.key === PaymentMilestoneKey.RENEWAL);
      if (renewal?.status === PaymentMilestoneStatus.LOCKED) {
        await this.prisma.servicePaymentMilestone.update({
          where: { id: renewal.id },
          data: { status: PaymentMilestoneStatus.PAYABLE },
        });
      }
    }

    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'SEEKER_SERVICE_PLAN',
      onBehalfOfId: plan.id,
      action: 'SERVICE_STEP_CONFIRM',
      metadata: { stepId: step.id, key: step.key, unlockedNextStepId: next?.id ?? null },
    });

    if (isStaff && plan.seekerUserId !== actor.sub) {
      await this.notifications.create({
        tenantId: actor.tenantId,
        userId: plan.seekerUserId,
        title: `${step.title}已确认`,
        body: next ? `下一环节「${next.title}」已解锁。` : '你的 6 步服务计划已完成全部环节。',
        category: 'SERVICE_PLAN',
        metadata: { planId: plan.id, stepId: step.id, nextStepId: next?.id ?? null },
      });
    }

    return this.getById(actor, plan.id);
  }

  async feedbackStepInteraction(
    actor: JwtAccessPayload,
    planId: string,
    stepId: string,
    interactionId: string,
    dto: FeedbackServiceStepDto,
  ) {
    const plan = await this.getById(actor, planId);
    const step = plan.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('服务环节不存在');
    const isOwner = actor.role === PlatformRole.JOB_SEEKER && plan.seekerUserId === actor.sub;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException();

    const interaction = await this.prisma.serviceStepInteraction.findFirst({
      where: {
        id: interactionId,
        tenantId: actor.tenantId,
        stepId: step.id,
      },
    });
    if (!interaction) throw new NotFoundException('服务输出不存在');

    const updated = await this.prisma.serviceStepInteraction.update({
      where: { id: interaction.id },
      data: {
        feedbackRating: dto.rating,
        feedbackText: dto.feedbackText?.trim() || null,
        feedbackAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'SEEKER_SERVICE_PLAN',
      onBehalfOfId: plan.id,
      action: 'SERVICE_STEP_FEEDBACK',
      metadata: {
        stepId: step.id,
        key: step.key,
        interactionId: interaction.id,
        rating: dto.rating,
        feedbackText: dto.feedbackText?.trim() || null,
      },
    });

    return {
      interaction: updated,
      plan: await this.getById(actor, plan.id),
    };
  }
}
