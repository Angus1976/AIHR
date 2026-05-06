import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAccessPayload } from '../auth/jwt-payload';
import { CreateWechatJsapiOrderDto } from './dto/create-wechat-jsapi-order.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** 小程序 / JSAPI 预下单：返回调起支付参数或 stub */
  @Post('wechat/jsapi')
  @UseGuards(JwtAuthGuard)
  createWechatJsapi(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateWechatJsapiOrderDto,
  ) {
    return this.payments.createWechatJsapiOrder(user, dto);
  }

  /**
   * 微信支付 v3 异步通知（公网 HTTPS，无需 JWT）。
   * 生产环境必须校验 Wechatpay-Signature 与证书链（此处为 MVP：解密成功则更新订单）。
   */
  @Post('wechat/notify')
  @HttpCode(200)
  async wechatNotify(@Body() body: unknown) {
    return this.payments.handleWechatNotify(body);
  }
}
