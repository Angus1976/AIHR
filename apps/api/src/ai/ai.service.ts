import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { LlmRouterService } from '../integrations/llm-router.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { ImproveServicePromptDto } from './dto/improve-service-prompt.dto';
import { InvokeTestDto } from './dto/invoke-test.dto';
import { PatchRouteDto } from './dto/patch-route.dto';
import { UpsertPromptDto } from './dto/upsert-prompt.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmRouterService,
  ) {}

  private assertStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException();
    }
  }

  async listPrompts(actor: JwtAccessPayload) {
    this.assertStaff(actor);
    return this.prisma.aiPromptTemplate.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { key: 'asc' },
    });
  }

  async upsertPrompt(actor: JwtAccessPayload, dto: UpsertPromptDto) {
    this.assertStaff(actor);
    const key = dto.key.trim();
    return this.prisma.aiPromptTemplate.upsert({
      where: { tenantId_key: { tenantId: actor.tenantId, key } },
      create: {
        tenantId: actor.tenantId,
        key,
        title: dto.title?.trim() || null,
        body: dto.body,
      },
      update: {
        title: dto.title?.trim() || null,
        body: dto.body,
        version: { increment: 1 },
      },
    });
  }

  async listRoutes(actor: JwtAccessPayload, scenario?: string) {
    this.assertStaff(actor);
    return this.prisma.aiLlmRoute.findMany({
      where: {
        tenantId: actor.tenantId,
        ...(scenario?.trim() ? { scenario: scenario.trim() } : {}),
      },
      orderBy: [{ weight: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async createRoute(actor: JwtAccessPayload, dto: CreateRouteDto) {
    this.assertStaff(actor);
    return this.prisma.aiLlmRoute.create({
      data: {
        tenantId: actor.tenantId,
        scenario: dto.scenario?.trim() || 'default',
        provider: dto.provider.trim(),
        modelName: dto.modelName.trim(),
        baseUrl: dto.baseUrl?.trim() || null,
        apiKeyEnv: dto.apiKeyEnv?.trim() || null,
        weight: dto.weight ?? 100,
        enabled: dto.enabled ?? true,
      },
    });
  }

  async patchRoute(actor: JwtAccessPayload, id: string, dto: PatchRouteDto) {
    this.assertStaff(actor);
    const row = await this.prisma.aiLlmRoute.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    if (!row) throw new NotFoundException('路由不存在');
    return this.prisma.aiLlmRoute.update({
      where: { id: row.id },
      data: {
        ...(dto.scenario !== undefined ? { scenario: dto.scenario.trim() } : {}),
        ...(dto.provider !== undefined ? { provider: dto.provider.trim() } : {}),
        ...(dto.modelName !== undefined ? { modelName: dto.modelName.trim() } : {}),
        ...(dto.baseUrl !== undefined
          ? { baseUrl: dto.baseUrl === null ? null : dto.baseUrl.trim() || null }
          : {}),
        ...(dto.apiKeyEnv !== undefined
          ? { apiKeyEnv: dto.apiKeyEnv === null ? null : dto.apiKeyEnv.trim() || null }
          : {}),
        ...(dto.weight !== undefined ? { weight: dto.weight } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
      },
    });
  }

  async invokeTest(actor: JwtAccessPayload, dto: InvokeTestDto) {
    this.assertStaff(actor);
    const messages =
      dto.messages?.length ?
        dto.messages.map((m) => ({ role: m.role, content: m.content }))
      : [{ role: 'user' as const, content: '你好，这是一条连通性测试。' }];
    return this.llm.complete({
      tenantId: actor.tenantId,
      scenario: dto.scenario,
      messages,
    });
  }

  async serviceStepInsights(actor: JwtAccessPayload) {
    this.assertStaff(actor);
    const [prompts, interactions] = await Promise.all([
      this.prisma.aiPromptTemplate.findMany({
        where: { tenantId: actor.tenantId, key: { startsWith: 'service_step_' } },
        orderBy: { key: 'asc' },
      }),
      this.prisma.serviceStepInteraction.findMany({
        where: { tenantId: actor.tenantId, promptKey: { startsWith: 'service_step_' } },
        orderBy: { createdAt: 'desc' },
        take: 800,
        include: {
          requestedBy: { select: { displayName: true, role: true } },
          step: { select: { title: true, key: true } },
        },
      }),
    ]);

    return prompts.map((prompt) => {
      const rows = interactions.filter((x) => x.promptKey === prompt.key);
      const rated = rows.filter((x) => typeof x.feedbackRating === 'number');
      const avgRating =
        rated.length ?
          Math.round((rated.reduce((sum, x) => sum + (x.feedbackRating ?? 0), 0) / rated.length) * 10) / 10
        : null;
      const lowFeedbacks = rated
        .filter((x) => (x.feedbackRating ?? 0) <= 3)
        .slice(0, 5)
        .map((x) => ({
          id: x.id,
          rating: x.feedbackRating,
          feedbackText: x.feedbackText,
          outputText: x.outputText.slice(0, 300),
          requestedBy: x.requestedBy,
          createdAt: x.createdAt,
        }));
      return {
        key: prompt.key,
        title: prompt.title,
        version: prompt.version,
        body: prompt.body,
        interactionCount: rows.length,
        feedbackCount: rated.length,
        avgRating,
        lowFeedbacks,
        latestOutput: rows[0]?.outputText.slice(0, 300) ?? null,
      };
    });
  }

  async improveServicePrompt(
    actor: JwtAccessPayload,
    key: string,
    dto: ImproveServicePromptDto,
  ) {
    this.assertStaff(actor);
    if (!key.startsWith('service_step_')) {
      throw new BadRequestException('只能优化服务环节提示词');
    }
    const prompt = await this.prisma.aiPromptTemplate.findUnique({
      where: { tenantId_key: { tenantId: actor.tenantId, key } },
    });
    if (!prompt) throw new NotFoundException('提示词不存在');

    const feedbacks = await this.prisma.serviceStepInteraction.findMany({
      where: {
        tenantId: actor.tenantId,
        promptKey: key,
        feedbackRating: { not: null },
      },
      orderBy: { feedbackAt: 'desc' },
      take: 30,
      select: {
        feedbackRating: true,
        feedbackText: true,
        inputText: true,
        outputText: true,
      },
    });
    const feedbackText =
      feedbacks.length ?
        feedbacks
          .map(
            (x, idx) =>
              `#${idx + 1} 评分:${x.feedbackRating}\n反馈:${x.feedbackText ?? '无'}\n输入:${x.inputText ?? '无'}\n输出摘要:${x.outputText.slice(0, 240)}`,
          )
          .join('\n\n')
      : '暂无用户反馈，请基于提示词本身提升结构化程度、可执行性、合规边界和中文表达清晰度。';

    const result = await this.llm.complete({
      tenantId: actor.tenantId,
      scenario: 'default',
      messages: [
        {
          role: 'system',
          content:
            '你是就业服务产品的提示词优化专家。请只输出“优化后的完整提示词正文”，不要解释过程，不要加标题。',
        },
        {
          role: 'user',
          content: [
            `提示词 key: ${key}`,
            `当前标题: ${prompt.title ?? ''}`,
            '当前提示词:',
            prompt.body,
            '用户反馈样本:',
            feedbackText,
            '请给出优化后的完整提示词正文，要求：输出结构更清晰、服务建议更可执行、避免夸大承诺、符合中国就业服务合规语境。',
          ].join('\n\n'),
        },
      ],
    });

    let applied = false;
    if (dto.apply) {
      await this.prisma.aiPromptTemplate.update({
        where: { id: prompt.id },
        data: { body: result.text, version: { increment: 1 } },
      });
      applied = true;
    }
    return {
      key,
      applied,
      suggestion: result.text,
      vendor: result.vendor,
      modelName: result.modelName ?? null,
      routeId: result.routeId ?? null,
      feedbackSamples: feedbacks.length,
    };
  }
}
