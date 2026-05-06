<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  welcomeText: string | null;
  wxMiniAppId: string | null;
};

const tenant = ref<Tenant | null>(null);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const form = ref({
  name: '',
  logoUrl: '',
  primaryColor: '',
  accentColor: '',
  welcomeText: '',
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    tenant.value = await api<Tenant>('/tenant/current');
    form.value = {
      name: tenant.value.name,
      logoUrl: tenant.value.logoUrl ?? '',
      primaryColor: tenant.value.primaryColor ?? '',
      accentColor: tenant.value.accentColor ?? '',
      welcomeText: tenant.value.welcomeText ?? '',
    };
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function save() {
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    tenant.value = await api<Tenant>('/tenant/current', {
      method: 'PATCH',
      body: JSON.stringify({
        name: form.value.name.trim() || undefined,
        logoUrl: form.value.logoUrl.trim() || undefined,
        primaryColor: form.value.primaryColor.trim() || undefined,
        accentColor: form.value.accentColor.trim() || undefined,
        welcomeText: form.value.welcomeText.trim() || undefined,
      }),
    });
    msg.value = '租户配置已保存';
  } catch (e) {
    err.value = e instanceof Error ? e.message : '保存失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="page">
    <div class="head">
      <div>
        <h1>租户与品牌</h1>
        <p class="muted">维护白标展示信息；当前 UI token 仍由工程控制，避免随意偏离品牌视觉。</p>
      </div>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>

    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card shell">
      <div class="preview">
        <div class="mark">{{ (form.name || '职').slice(0, 1) }}</div>
        <div>
          <strong>{{ form.name || tenant?.name || '职AI通' }}</strong>
          <p>{{ form.welcomeText || '从求职准备到职场成长的一站式服务' }}</p>
        </div>
      </div>
      <div class="form">
        <label>租户名称 <input v-model="form.name" maxlength="80" /></label>
        <label>Logo URL <input v-model="form.logoUrl" maxlength="1024" /></label>
        <label>主色（记录用） <input v-model="form.primaryColor" maxlength="40" placeholder="#243F34" /></label>
        <label>强调色（记录用） <input v-model="form.accentColor" maxlength="40" placeholder="#B87932" /></label>
        <label>欢迎语 <textarea v-model="form.welcomeText" rows="3" maxlength="200" /></label>
        <button type="button" class="btn primary" :disabled="loading" @click="save">保存配置</button>
      </div>
    </section>

    <section v-if="tenant" class="card meta">
      <h2>租户元信息</h2>
      <div class="meta-grid">
        <span>Slug</span><strong>{{ tenant.slug }}</strong>
        <span>小程序 AppID</span><strong>{{ tenant.wxMiniAppId || '未绑定' }}</strong>
        <span>Tenant ID</span><strong class="mono">{{ tenant.id }}</strong>
      </div>
    </section>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.page h1 { margin: 0; }
.muted { color: var(--color-muted); font-size: 14px; line-height: 1.7; }
.ok { color: var(--color-success); }
.bad { color: var(--color-warning); }
.shell { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(280px, 1.15fr); gap: 1.5rem; margin: 1rem 0; padding: 1rem; }
.preview { min-height: 260px; min-width: 0; padding: 1.5rem; border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: linear-gradient(145deg, var(--color-bg), var(--color-accent-soft)); display: flex; align-items: flex-end; gap: 1rem; }
.mark { flex: 0 0 auto; width: 64px; height: 64px; border-radius: 20px; background: var(--color-primary-strong); color: oklch(0.98 0.008 80); display: grid; place-items: center; font-size: 1.8rem; font-weight: 800; }
.preview strong { display: block; font-size: 1.35rem; color: var(--color-primary-strong); overflow-wrap: anywhere; word-break: break-word; }
.preview p { margin: 0.35rem 0 0; color: var(--color-muted); overflow-wrap: anywhere; word-break: break-word; }
.form { display: flex; flex-direction: column; gap: 0.85rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; color: var(--color-muted); font-size: 13px; }
input, textarea { font: inherit; padding: 0.5rem 0.6rem; border: 1px solid var(--color-line); border-radius: 10px; }
.btn { border: none; border-radius: 10px; padding: 0.5rem 0.9rem; cursor: pointer; }
.btn.primary { background: var(--color-primary); color: oklch(0.98 0.008 80); }
.btn.ghost { background: var(--color-card); border: 1px solid var(--color-line); color: var(--color-primary-strong); }
.meta { padding: 1.25rem; overflow: hidden; }
.meta h2 { margin: 0 0 1rem; }
.meta-grid { display: grid; grid-template-columns: minmax(96px, 140px) minmax(0, 1fr); gap: 0.65rem 1rem; font-size: 14px; align-items: start; }
.meta-grid span { color: var(--color-muted); min-width: 0; overflow-wrap: anywhere; }
.meta-grid strong { display: block; min-width: 0; max-width: 100%; overflow-wrap: anywhere; word-break: break-all; }
.mono { font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.6; }
@media (max-width: 1180px) {
  .shell { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .head { flex-direction: column; }
  .shell { padding: 0.8rem; }
  .preview { flex-direction: column; align-items: flex-start; min-height: 200px; }
  .meta-grid { grid-template-columns: 1fr; gap: 0.25rem 0; }
  .meta-grid strong { margin-bottom: 0.55rem; }
}
</style>
