/**
 * 统一 API 请求：超时、一次性重试（弱网）、友好错误文案。
 * @param {{ url: string, method?: string, data?: object, header?: object, timeout?: number }} opts
 */
const DEFAULT_TIMEOUT_MS = 60000;
const MAX_NETWORK_RETRIES = 1;

function getAppSafe() {
  try {
    return getApp();
  } catch {
    return { globalData: { apiBase: '' } };
  }
}

function shouldRetryNetwork(err) {
  const m = err && err.errMsg ? String(err.errMsg) : '';
  return (
    /timeout|time\s*out|fail\s*connect|fail\s*ssl|ECONNRESET|reset/i.test(m) &&
    !/domain|not\s*in\s*list|403|401/i.test(m)
  );
}

function normalizeFailError(err) {
  if (!err) return '网络请求失败';
  const m = err.errMsg ? String(err.errMsg) : '';
  if (!m) return '网络请求失败';
  if (/timeout|time\s*out/i.test(m)) return '请求超时，请稍后重试';
  if (/domain|not\s*in\s*.*\s*domain|合法域名/i.test(m))
    return '请检查小程序合法域名与 apiBase 配置';
  return m;
}

function requestWithAttempt(opts, attempt) {
  const app = getAppSafe();
  const base = (app.globalData && app.globalData.apiBase
    ? app.globalData.apiBase
    : ''
  ).replace(/\/$/, '');
  const path = opts.url.startsWith('http')
    ? opts.url
    : `${base}${opts.url.startsWith('/') ? '' : '/'}${opts.url}`;

  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('accessToken');
    const authHeader =
      token && typeof token === 'string' ? { Authorization: `Bearer ${token}` } : {};

    wx.request({
      url: path,
      method: opts.method || 'GET',
      data: opts.data,
      timeout: opts.timeout != null ? opts.timeout : DEFAULT_TIMEOUT_MS,
      header: {
        'content-type': 'application/json',
        ...authHeader,
        ...(opts.header || {}),
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        if (res.statusCode === 401) {
          const hadToken = !!(token && typeof token === 'string');
          try {
            wx.removeStorageSync('accessToken');
          } catch {
            /* ignore */
          }
          if (hadToken) {
            wx.showToast({ title: '登录已失效，请重新登录', icon: 'none', duration: 2500 });
          }
        }
        const d = res.data;
        let msg =
          res.statusCode === 429
            ? '操作过于频繁，请稍后再试'
            : res.statusCode === 502
              ? '服务暂时无响应，请稍后再试'
              : res.statusCode === 503
                ? '服务暂不可用，请稍后再试'
                : res.statusCode === 413
                  ? '内容过大，请减少后重试'
                  : `HTTP ${res.statusCode}`;
        if (d && typeof d === 'object' && d.message) {
          msg = Array.isArray(d.message) ? d.message.join('; ') : String(d.message);
        } else if (d && typeof d === 'object' && d.statusCode && d.timestamp) {
          msg = Array.isArray(d.message) ? d.message.join('; ') : msg;
        }
        const rid =
          (d && typeof d === 'object' && d.requestId) ||
          (res.header &&
            (res.header['X-Request-Id'] || res.header['x-request-id'] || res.header['X-request-id']));
        if (rid) {
          msg = `${msg} [requestId: ${String(rid)}]`;
        }
        reject(new Error(msg));
      },
      fail(err) {
        if (attempt < MAX_NETWORK_RETRIES && shouldRetryNetwork(err)) {
          setTimeout(() => {
            requestWithAttempt(opts, attempt + 1)
              .then(resolve)
              .catch(reject);
          }, 400);
          return;
        }
        reject(new Error(normalizeFailError(err)));
      },
    });
  });
}

function request(opts) {
  return requestWithAttempt(opts, 0);
}

module.exports = { request };
