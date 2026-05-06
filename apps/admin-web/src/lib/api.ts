const TOKEN_KEY = 'aihr_access_token';
const DEFAULT_TIMEOUT_MS = 45_000;

let onUnauthorized: (() => void) | null = null;

/** 登录态失效时回调（在 main 中挂接到 Vue Router，避免各页重复处理 401） */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const url = path.startsWith('http')
    ? path
    : `/v1${path.startsWith('/') ? path : `/${path}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, headers, signal: controller.signal });
    if (res.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    if (!res.ok) {
      let msg: string;
      if (res.status === 429) {
        msg = '请求过于频繁，请稍后再试';
      } else if (res.status === 502) {
        msg = '上游服务无响应，请稍后再试';
      } else if (res.status === 503) {
        msg = '服务暂不可用，请稍后再试';
      } else if (res.status === 413) {
        msg = '请求体过大，请减少内容或联系管理员调整限制';
      } else {
        msg = `HTTP ${res.status}`;
      }
      let requestId: string | undefined;
      try {
        const j = (await res.json()) as { message?: string | string[]; requestId?: string };
        requestId = typeof j.requestId === 'string' ? j.requestId : undefined;
        if (typeof j.message === 'string') msg = j.message;
        else if (Array.isArray(j.message)) msg = j.message.join('; ');
      } catch {
        /* ignore */
      }
      if (!requestId) {
        const h = res.headers.get('x-request-id');
        if (h) requestId = h;
      }
      if (requestId) {
        msg = `${msg} [requestId: ${requestId}]`;
      }
      throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('请求超时，请检查网络或稍后重试');
    }
    if (e instanceof TypeError) {
      const m = e.message || '';
      if (/fetch|network|failed|load/i.test(m)) {
        throw new Error('网络异常，请检查网络、代理或 API 是否可达');
      }
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
