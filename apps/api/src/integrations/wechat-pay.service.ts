import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import {
  buildMiniProgramPaySign,
  buildWechatPayAuthorization,
} from './wechat-pay-v3.util';
import { decryptWechatResource } from './wechat-pay-crypto.util';
import type { WechatNotifyResource } from './wechat-pay-crypto.util';

const JSAPI_PATH = '/v3/pay/transactions/jsapi';

export type JsapiUnifiedOrderResult = {
  prepay_id: string;
};

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);

  /** 供支付模块在统一下单时读取（勿记录日志） */
  getMerchantPrivateKeyPem(): string | null {
    return this.loadPrivateKeyPem();
  }

  private loadPrivateKeyPem(): string | null {
    const path = process.env.WECHAT_PAY_PRIVATE_KEY_PATH;
    if (path) {
      try {
        return fs.readFileSync(path, 'utf8');
      } catch (e) {
        this.logger.error(`读取商户私钥失败: ${path}`, e);
        return null;
      }
    }
    const inline = process.env.WECHAT_PAY_PRIVATE_KEY_PEM?.replace(/\\n/g, '\n');
    return inline?.trim() ? inline : null;
  }

  /** 是否具备发起真实 JSAPI 预下单的最小配置 */
  isConfigured(): boolean {
    const mchid = process.env.WECHAT_PAY_MCH_ID?.trim();
    const serial = process.env.WECHAT_PAY_CERT_SERIAL?.trim();
    const apiV3 = process.env.WECHAT_PAY_API_V3_KEY?.trim();
    const notify = process.env.WECHAT_PAY_NOTIFY_URL?.trim();
    const pem = this.loadPrivateKeyPem();
    const appId =
      process.env.WECHAT_PAY_APP_ID?.trim() ??
      process.env.WECHAT_MINI_APP_ID?.trim();
    return Boolean(mchid && serial && apiV3 && notify && pem && appId);
  }

  /**
   * 统一下单（JSAPI / 小程序支付同一接口）。
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4012791860
   */
  async unifiedJsapiOrder(params: {
    appId: string;
    mchid: string;
    serialNo: string;
    privateKeyPem: string;
    openid: string;
    outTradeNo: string;
    description: string;
    amountFen: number;
    notifyUrl: string;
  }): Promise<JsapiUnifiedOrderResult> {
    const bodyObj = {
      appid: params.appId,
      mchid: params.mchid,
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: params.notifyUrl,
      amount: { total: params.amountFen, currency: 'CNY' },
      payer: { openid: params.openid },
    };
    const body = JSON.stringify(bodyObj);
    const { authorization } = buildWechatPayAuthorization(
      params.mchid,
      params.serialNo,
      params.privateKeyPem,
      'POST',
      JSAPI_PATH,
      body,
    );
    let data: { prepay_id?: string; code?: string; message?: string };
    try {
      const res = await axios.post<{
        prepay_id?: string;
        code?: string;
        message?: string;
      }>(`https://api.mch.weixin.qq.com${JSAPI_PATH}`, bodyObj, {
        headers: {
          Authorization: authorization,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Jobde/1.0 (NestJS)',
        },
        timeout: 15_000,
      });
      data = res.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const d = e.response.data as { message?: string; code?: string };
        throw new Error(d.message ?? d.code ?? e.message);
      }
      throw e;
    }
    if (!data.prepay_id) {
      const msg = data.message ?? data.code ?? '无 prepay_id';
      throw new Error(`微信下单失败: ${msg}`);
    }
    return { prepay_id: data.prepay_id };
  }

  buildMiniProgramPayParams(prepayId: string): {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: 'RSA';
    paySign: string;
  } {
    const appId =
      process.env.WECHAT_PAY_APP_ID?.trim() ??
      process.env.WECHAT_MINI_APP_ID?.trim();
    const pem = this.getMerchantPrivateKeyPem();
    if (!appId || !pem) {
      throw new Error('缺少 WECHAT_PAY_APP_ID 或商户私钥');
    }
    const timeStamp = `${Math.floor(Date.now() / 1000)}`;
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const pkg = `prepay_id=${prepayId}`;
    const paySign = buildMiniProgramPaySign(
      appId,
      timeStamp,
      nonceStr,
      pkg,
      pem,
    );
    return {
      timeStamp,
      nonceStr,
      package: pkg,
      signType: 'RSA',
      paySign,
    };
  }

  /** 解析并解密支付成功通知中的订单信息 */
  parseNotifyTransaction(
    body: unknown,
  ): { outTradeNo: string; transactionId: string } | null {
    const b = body as {
      event_type?: string;
      resource?: WechatNotifyResource;
    };
    if (b.event_type !== 'TRANSACTION.SUCCESS' || !b.resource) {
      return null;
    }
    const apiV3 = process.env.WECHAT_PAY_API_V3_KEY?.trim();
    if (!apiV3) return null;
    try {
      const plain = decryptWechatResource(apiV3, b.resource);
      const data = JSON.parse(plain) as {
        out_trade_no?: string;
        transaction_id?: string;
      };
      if (!data.out_trade_no || !data.transaction_id) return null;
      return {
        outTradeNo: data.out_trade_no,
        transactionId: data.transaction_id,
      };
    } catch (e) {
      this.logger.warn('支付回调解密失败', e);
      return null;
    }
  }

  createJsapiPayStub(orderId: string, amountFen: number) {
    this.logger.warn(
      `WechatPay stub: orderId=${orderId}, amountFen=${amountFen}`,
    );
    return {
      mode: 'stub',
      orderId,
      amountFen,
      message: '未配置完整微信支付参数，未调用统一下单',
    };
  }
}
