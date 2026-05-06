import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type LlmChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

/**
 * 多厂商 LLM 路由：优先读租户 `AiLlmRoute` / `AiPromptTemplate`，未配置时回退占位。
 */
@Injectable()
export class LlmRouterService {
  private readonly logger = new Logger(LlmRouterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async capabilityState(): Promise<'no_routes' | 'db_routes'> {
    const n = await this.prisma.aiLlmRoute.count({ where: { enabled: true } });
    return n > 0 ? 'db_routes' : 'no_routes';
  }

  async complete(params: {
    tenantId: string;
    messages: LlmChatMessage[];
    preferredVendor?: string;
    scenario?: string;
  }): Promise<{ text: string; vendor: string; modelName?: string; routeId?: string }> {
    const scenario = params.scenario?.trim() || 'default';
    const systemTpl = await this.prisma.aiPromptTemplate.findUnique({
      where: { tenantId_key: { tenantId: params.tenantId, key: 'default_system' } },
    });
    const merged: LlmChatMessage[] = [];
    if (systemTpl?.body?.trim()) {
      merged.push({ role: 'system', content: systemTpl.body.trim() });
    }
    merged.push(...params.messages);

    let routes = await this.prisma.aiLlmRoute.findMany({
      where: {
        tenantId: params.tenantId,
        scenario,
        enabled: true,
        ...(params.preferredVendor
          ? { provider: params.preferredVendor }
          : {}),
      },
      orderBy: [{ weight: 'desc' }, { updatedAt: 'desc' }],
    });
    if (!routes.length && scenario !== 'default') {
      routes = await this.prisma.aiLlmRoute.findMany({
        where: {
          tenantId: params.tenantId,
          scenario: 'default',
          enabled: true,
          ...(params.preferredVendor ? { provider: params.preferredVendor } : {}),
        },
        orderBy: [{ weight: 'desc' }, { updatedAt: 'desc' }],
      });
    }
    const route = routes[0];

    if (!route) {
      this.logger.warn(`租户 ${params.tenantId} 场景 ${scenario} 无可用路由，返回占位`);
      return {
        vendor: 'stub',
        text: '服务建议暂未完成配置，请稍后重试或联系平台处理。',
      };
    }

    if (route.provider === 'stub' || !route.apiKeyEnv?.trim()) {
      this.logger.warn(`租户 ${params.tenantId} 场景 ${scenario} 使用占位路由 ${route.id}`);
      return {
        vendor: 'stub',
        modelName: route.modelName,
        routeId: route.id,
        text: '服务建议已记录，平台将结合本环节信息继续完善，请稍后查看更新。',
      };
    }

    this.logger.warn(
      `路由 ${route.id} (${route.provider}) 尚未接入真实 HTTP 调用，返回占位`,
    );
    return {
      vendor: route.provider,
      modelName: route.modelName,
      routeId: route.id,
      text: '服务建议暂未完成配置，请稍后重试或联系平台处理。',
    };
  }
}
