import * as crypto from 'crypto';

export function buildWechatPayAuthorization(
  mchid: string,
  serialNo: string,
  privateKeyPem: string,
  method: string,
  canonicalUrlPath: string,
  body: string,
): { authorization: string; timestamp: string; nonceStr: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const message = `${method}\n${canonicalUrlPath}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(message)
    .sign(privateKeyPem, 'base64');
  const token = [
    `mchid="${mchid}"`,
    `nonce_str="${nonceStr}"`,
    `timestamp="${timestamp}"`,
    `serial_no="${serialNo}"`,
    `signature="${signature}"`,
  ].join(',');
  return {
    authorization: `WECHATPAY2-SHA256-RSA2048 ${token}`,
    timestamp,
    nonceStr,
  };
}

/** 小程序调起支付时的 paySign（API v3） */
export function buildMiniProgramPaySign(
  appId: string,
  timeStamp: string,
  nonceStr: string,
  packageStr: string,
  privateKeyPem: string,
): string {
  const message = `${appId}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`;
  return crypto
    .createSign('RSA-SHA256')
    .update(message)
    .sign(privateKeyPem, 'base64');
}
