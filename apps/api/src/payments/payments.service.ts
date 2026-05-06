import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  OrderKind,
  OrderStatus,
  PaymentMilestoneStatus,
  PlatformRole,
  RefundRequestStatus,
} from '@prisma/client';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CommerceService } from '../commerce/commerce.service';
import { WechatPayService } from '../integrations/wechat-pay.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWechatJsapiOrderDto } from './dto/create-wechat-jsapi-order.dto';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { ReviewRefundRequestDto } from './dto/review-refund-request.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatPay: WechatPayService,
    private readonly audit: AuditService,
    private readonly commerce: CommerceService,
  ) {}

  private newOutTradeNo(): string {
    const raw = `O${Date.now()}${crypto.randomBytes(6).toString('hex')}`;
    return raw.slice(0, 32);
  }

  async createWechatJsapiOrder(
    actor: JwtAccessPayload,
    dto: CreateWechatJsapiOrderDto,
  ) {
    const localSimulator = process.env.LOCAL_SIMULATOR_ENABLED === 'true';
    const wx = await this.prisma.wxMiniUser.findFirst({
      where: { userId: actor.sub, tenantId: actor.tenantId },
    });
    if (!wx && !localSimulator) {
      throw new UnprocessableEntityException(
        '请先在微信小程序登录，绑定 openid 后再发起支付',
      );
    }
    const appId =
      process.env.WECHAT_PAY_APP_ID?.trim() ??
      process.env.WECHAT_MINI_APP_ID?.trim() ??
      (localSimulator ? 'local-simulator-appid' : undefined);
    if (!appId && !localSimulator) {
      throw new UnprocessableEntityException('缺少 WECHAT_MINI_APP_ID');
    }
    const payAppId = appId ?? 'local-simulator-appid';
    const product = dto.productId
      ? await this.commerce.getEnabledProduct(actor, dto.productId)
      : null;
    const milestone = dto.milestoneId
      ? await this.prisma.servicePaymentMilestone.findFirst({
          where: {
            id: dto.milestoneId,
            plan: { tenantId: actor.tenantId, seekerUserId: actor.sub },
          },
          include: { plan: true },
        })
      : null;
    if (dto.milestoneId && !milestone) {
      throw new BadRequestException('付款节点不存在或无权支付');
    }
    if (milestone?.status === PaymentMilestoneStatus.LOCKED) {
      throw new BadRequestException('该付款节点尚未解锁');
    }
    if (milestone && milestone.amountFen <= 0) {
      throw new BadRequestException('该付款节点无需付款');
    }
    const amountFen = milestone?.amountFen ?? product?.amountFen ?? dto.amountFen;
    const kind = milestone ? OrderKind.SEEKER_SERVICE_FEE : product?.orderKind ?? dto.kind;
    const desc =
      dto.description?.trim() ||
      milestone?.title ||
      product?.name ||
      (kind === OrderKind.SEEKER_SERVICE_FEE
        ? '职AI通 · 求职服务费'
        : '职AI通 · 订单');
    const outTradeNo = this.newOutTradeNo();
    const order = await this.prisma.order.create({
      data: {
        tenantId: actor.tenantId,
        payerUserId: actor.sub,
        kind,
        amountFen,
        description: desc,
        status: OrderStatus.PENDING,
        outTradeNo,
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'USER',
      onBehalfOfId: actor.sub,
      action: 'ORDER_CREATE',
      metadata: {
        orderId: order.id,
        outTradeNo,
        amountFen,
        kind,
        productId: product?.id ?? null,
        milestoneId: milestone?.id ?? null,
      },
    });
    const notifyUrl = process.env.WECHAT_PAY_NOTIFY_URL?.trim();
    if (localSimulator || !this.wechatPay.isConfigured() || !notifyUrl) {
      this.wechatPay.createJsapiPayStub(order.id, amountFen);
      if (milestone) {
        await this.prisma.servicePaymentMilestone.update({
          where: { id: milestone.id },
          data: {
            orderId: order.id,
            status: localSimulator
              ? PaymentMilestoneStatus.PAID
              : PaymentMilestoneStatus.PAYABLE,
          },
        });
      }
      if (localSimulator) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID, wechatTradeState: 'LOCAL_SIMULATOR_PAID' },
        });
      }
      return {
        mode: 'stub' as const,
        orderId: order.id,
        outTradeNo,
        amountFen,
        productId: product?.id ?? null,
        milestoneId: milestone?.id ?? null,
        paid: localSimulator,
        message:
          localSimulator
            ? '本地模拟支付已完成，订单与付款节点已标记为已支付'
            : '未配置完整微信商户参数或未设置 WECHAT_PAY_NOTIFY_URL，订单已落库为待支付',
      };
    }
    const mchid = process.env.WECHAT_PAY_MCH_ID!.trim();
    const serial = process.env.WECHAT_PAY_CERT_SERIAL!.trim();
    const pem = this.wechatPay.getMerchantPrivateKeyPem();
    if (!pem) {
      throw new BadRequestException('无法读取商户私钥');
    }
    try {
      const { prepay_id } = await this.wechatPay.unifiedJsapiOrder({
        appId: payAppId,
        mchid,
        serialNo: serial,
        privateKeyPem: pem,
        openid: wx!.openid,
        outTradeNo,
        description: desc,
        amountFen,
        notifyUrl,
      });
      await this.prisma.order.update({
        where: { id: order.id },
        data: { wechatPrepayId: prepay_id },
      });
      if (milestone) {
        await this.prisma.servicePaymentMilestone.update({
          where: { id: milestone.id },
          data: { orderId: order.id, status: PaymentMilestoneStatus.PAYABLE },
        });
      }
      const pay = this.wechatPay.buildMiniProgramPayParams(prepay_id);
      return {
        mode: 'live' as const,
        orderId: order.id,
        outTradeNo,
        amountFen,
        productId: product?.id ?? null,
        milestoneId: milestone?.id ?? null,
        appId: payAppId,
        ...pay,
      };
    } catch (e) {
      this.logger.error('微信统一下单失败', e);
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      });
      const msg = e instanceof Error ? e.message : '微信下单失败';
      throw new BadRequestException(msg);
    }
  }

  async handleWechatNotify(body: unknown): Promise<{ code: string; message: string }> {
    try {
      const parsed = this.wechatPay.parseNotifyTransaction(body);
      if (!parsed) {
        this.logger.warn('支付回调：非支付成功事件或无法解析，仍返回 SUCCESS');
        return { code: 'SUCCESS', message: '成功' };
      }
      const updated = await this.prisma.order.updateMany({
        where: {
          outTradeNo: parsed.outTradeNo,
          status: OrderStatus.PENDING,
        },
        data: {
          status: OrderStatus.PAID,
          wechatTransactionId: parsed.transactionId,
          wechatTradeState: 'SUCCESS',
        },
      });
      if (updated.count > 0) {
        const order = await this.prisma.order.findUnique({
          where: { outTradeNo: parsed.outTradeNo },
        });
        if (order) {
          await this.prisma.servicePaymentMilestone.updateMany({
            where: { orderId: order.id },
            data: { status: PaymentMilestoneStatus.PAID },
          });
        }
        this.logger.log(`订单已支付: ${parsed.outTradeNo}`);
      }
    } catch (e) {
      this.logger.error('支付回调处理异常', e);
    }
    return { code: 'SUCCESS', message: '成功' };
  }

  async listOrdersForStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException('无权查看订单');
    }
    return this.prisma.order.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        payer: { select: { id: true, displayName: true, phone: true, email: true } },
      },
    });
  }

  async listMyOrders(actor: JwtAccessPayload) {
    return this.prisma.order.findMany({
      where: { tenantId: actor.tenantId, payerUserId: actor.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createRefundRequest(
    actor: JwtAccessPayload,
    orderId: string,
    dto: CreateRefundRequestDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: actor.tenantId },
    });
    if (!order) throw new BadRequestException('订单不存在');
    const isOwner = order.payerUserId === actor.sub;
    const isStaff = actor.role === PlatformRole.ADMIN || actor.role === PlatformRole.TEACHER;
    if (!isOwner && !isStaff) throw new ForbiddenException('无权申请该订单退款');
    if (dto.amountFen > order.amountFen) throw new BadRequestException('退款金额不可超过订单金额');
    const row = await this.prisma.refundRequest.create({
      data: {
        tenantId: actor.tenantId,
        orderId: order.id,
        requestedById: actor.sub,
        amountFen: dto.amountFen,
        reason: dto.reason?.trim() || null,
      },
      include: {
        order: true,
        requestedBy: { select: { id: true, displayName: true, phone: true, email: true } },
      },
    });
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ORDER',
      onBehalfOfId: order.id,
      action: 'REFUND_REQUEST_CREATE',
      metadata: { refundRequestId: row.id, amountFen: row.amountFen },
    });
    return row;
  }

  async listRefundRequestsForStaff(actor: JwtAccessPayload) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException('无权查看退款申请');
    }
    return this.prisma.refundRequest.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        order: true,
        requestedBy: { select: { id: true, displayName: true, phone: true, email: true } },
      },
    });
  }

  async listMyRefundRequests(actor: JwtAccessPayload) {
    return this.prisma.refundRequest.findMany({
      where: { tenantId: actor.tenantId, requestedById: actor.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { order: true },
    });
  }

  async reviewRefundRequest(
    actor: JwtAccessPayload,
    id: string,
    dto: ReviewRefundRequestDto,
  ) {
    if (actor.role !== PlatformRole.ADMIN && actor.role !== PlatformRole.TEACHER) {
      throw new ForbiddenException('无权审核退款申请');
    }
    const row = await this.prisma.refundRequest.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    if (!row) throw new BadRequestException('退款申请不存在');
    const updated = await this.prisma.refundRequest.update({
      where: { id: row.id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote?.trim() || null,
        reviewedById: actor.sub,
      },
      include: {
        order: true,
        requestedBy: { select: { id: true, displayName: true, phone: true, email: true } },
      },
    });
    if (dto.status === RefundRequestStatus.REFUNDED) {
      await this.prisma.order.update({
        where: { id: row.orderId },
        data: { status: OrderStatus.CLOSED },
      });
    }
    await this.audit.log({
      tenantId: actor.tenantId,
      performedById: actor.sub,
      onBehalfOfType: 'ORDER',
      onBehalfOfId: row.orderId,
      action: 'REFUND_REQUEST_REVIEW',
      metadata: { refundRequestId: row.id, from: row.status, to: dto.status },
    });
    return updated;
  }
}
