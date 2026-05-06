import * as crypto from 'crypto';

export type WechatNotifyResource = {
  algorithm: string;
  ciphertext: string;
  associated_data: string;
  nonce: string;
};

/**
 * 解密微信支付 v3 回调 resource（AEAD_AES_256_GCM）。
 * @see https://pay.weixin.qq.com/doc/v3/merchant/4012360866
 */
export function decryptWechatResource(
  apiV3Key: string,
  resource: WechatNotifyResource,
): string {
  if (resource.algorithm !== 'AEAD_AES_256_GCM') {
    throw new Error(`不支持的加密算法: ${resource.algorithm}`);
  }
  const key = Buffer.from(apiV3Key, 'utf8');
  if (key.length !== 32) {
    throw new Error('WECHAT_PAY_API_V3_KEY 须为 32 字节');
  }
  const nonce = Buffer.from(resource.nonce, 'utf8');
  if (nonce.length !== 12) {
    throw new Error('回调 nonce 长度异常');
  }
  const associatedData = Buffer.from(resource.associated_data ?? '', 'utf8');
  const buf = Buffer.from(resource.ciphertext, 'base64');
  const authTag = buf.subarray(buf.length - 16);
  const data = buf.subarray(0, buf.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce, {
    authTagLength: 16,
  });
  decipher.setAuthTag(authTag);
  decipher.setAAD(associatedData);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    'utf8',
  );
}
