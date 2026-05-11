import { reactive } from 'vue';
import { api, getToken } from './api';

const DEFAULT_NAME = '职得';
const DEFAULT_SUBTITLE = 'Jobde · 人才服务运营台';

/** 侧栏与全局展示用的租户品牌（与「租户品牌」页 /tenant/current 对齐） */
export const tenantBrand = reactive({
  name: DEFAULT_NAME,
  subtitle: DEFAULT_SUBTITLE,
  logoUrl: null as string | null,
});

export function resetTenantBrand() {
  tenantBrand.name = DEFAULT_NAME;
  tenantBrand.subtitle = DEFAULT_SUBTITLE;
  tenantBrand.logoUrl = null;
}

/** 用已拿到的租户对象更新侧栏（设置页加载/保存后调用） */
export function applyTenantBrand(t: { name?: string; logoUrl?: string | null }) {
  if (typeof t.name === 'string' && t.name.trim()) {
    tenantBrand.name = t.name.trim();
  }
  if (t.logoUrl !== undefined) {
    const u = t.logoUrl?.trim();
    tenantBrand.logoUrl = u || null;
  }
}

/** 带 token 时拉取当前租户并刷新侧栏；无 token 则恢复默认 */
export async function refreshTenantBrandFromApi(): Promise<void> {
  if (!getToken()) {
    resetTenantBrand();
    return;
  }
  try {
    const t = await api<{ name: string; logoUrl: string | null }>('/tenant/current');
    applyTenantBrand({ name: t.name, logoUrl: t.logoUrl });
  } catch {
    /* 保留上次成功态，避免频繁闪烁 */
  }
}
