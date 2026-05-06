import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

export type WeChatMiniSession = {
  openid: string;
  session_key: string;
  unionid?: string;
};

@Injectable()
export class WechatService {
  /**
   * 微信小程序 jscode2session（腾讯开放平台）。
   * @see https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
   */
  async code2Session(
    appId: string,
    secret: string,
    jsCode: string,
  ): Promise<WeChatMiniSession> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const { data } = await axios.get<{
      openid?: string;
      session_key?: string;
      unionid?: string;
      errcode?: number;
      errmsg?: string;
    }>(url, {
      params: {
        appid: appId,
        secret,
        js_code: jsCode,
        grant_type: 'authorization_code',
      },
      timeout: 10_000,
    });
    if (data.errcode && data.errcode !== 0) {
      throw new UnauthorizedException(
        data.errmsg ?? `微信登录失败: ${data.errcode}`,
      );
    }
    if (!data.openid || !data.session_key) {
      throw new UnauthorizedException('微信登录返回数据不完整');
    }
    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid,
    };
  }
}
