<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type Contract = {
  id: string;
  title: string;
  status: string;
  contentHash: string;
  signatureProvider: string | null;
  signatureRef: string | null;
  signedAt: string | null;
  createdAt: string;
  user?: { displayName: string; email: string | null; phone: string | null };
  enterprise?: { name: string };
};

type Template = { id: string; title: string; purpose: string; version: string };

const rows = ref<Contract[]>([]);
const templates = ref<Template[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const form = ref({
  userId: '',
  enterpriseId: '',
  orderId: '',
  jobApplicationId: '',
  templateId: '',
  title: '',
  content: '',
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    const [contracts, tpl] = await Promise.all([
      api<Contract[]>('/contracts'),
      api<Template[]>('/compliance/templates'),
    ]);
    rows.value = contracts;
    templates.value = tpl;
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function create() {
  err.value = '';
  msg.value = '';
  if (!form.value.userId.trim() || !form.value.title.trim()) {
    err.value = '请填写用户 ID 和标题';
    return;
  }
  loading.value = true;
  try {
    await api('/contracts', {
      method: 'POST',
      body: JSON.stringify({
        userId: form.value.userId.trim(),
        enterpriseId: form.value.enterpriseId.trim() || undefined,
        orderId: form.value.orderId.trim() || undefined,
        jobApplicationId: form.value.jobApplicationId.trim() || undefined,
        templateId: form.value.templateId || undefined,
        title: form.value.title.trim(),
        content: form.value.content.trim() || undefined,
      }),
    });
    msg.value = '协议已生成';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '创建失败';
  } finally {
    loading.value = false;
  }
}

async function signStub(row: Contract) {
  loading.value = true;
  err.value = '';
  try {
    await api(`/contracts/${row.id}/sign-stub`, {
      method: 'POST',
      body: JSON.stringify({ provider: 'tencent-signature-stub' }),
    });
    msg.value = '已完成签署占位';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '签署失败';
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
      <h1>合同与签章</h1>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>
    <p class="muted">当前接入腾讯系电子签占位：生成协议、内容 hash 存证、记录签署引用。</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card">
      <h2>生成协议</h2>
      <div class="grid">
        <label>用户 ID <input v-model="form.userId" /></label>
        <label>企业 ID（可选） <input v-model="form.enterpriseId" /></label>
        <label>订单 ID（可选） <input v-model="form.orderId" /></label>
        <label>投递 ID（可选） <input v-model="form.jobApplicationId" /></label>
        <label>
          模板
          <select v-model="form.templateId">
            <option value="">不使用模板</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">
              {{ t.purpose }} / {{ t.version }} / {{ t.title }}
            </option>
          </select>
        </label>
        <label>标题 <input v-model="form.title" /></label>
      </div>
      <label>正文（未选模板时必填） <textarea v-model="form.content" rows="5" /></label>
      <button type="button" class="btn primary" :disabled="loading" @click="create">生成协议</button>
    </section>

    <section class="card">
      <h2>协议列表</h2>
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>用户</th>
            <th>状态</th>
            <th>Hash</th>
            <th>签署引用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td>{{ r.title }}</td>
            <td>{{ r.user?.displayName ?? '—' }}</td>
            <td>{{ r.status }}</td>
            <td class="mono">{{ r.contentHash.slice(0, 16) }}…</td>
            <td class="mono">{{ r.signatureRef ?? '—' }}</td>
            <td>
              <button v-if="r.status !== 'SIGNED'" type="button" class="btn sm" @click="signStub(r)">
                签署占位
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; }
.page h1 { margin: 0; }
.muted { color: var(--color-muted); font-size: 14px; }
.ok { color: var(--color-success); }
.bad { color: var(--color-warning); }
.card { background: var(--color-card); border-radius: 12px; padding: 1.25rem; box-shadow: var(--shadow-card); margin-bottom: 1rem; }
.card h2 { margin: 0 0 1rem; font-size: 1.05rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.75rem; color: var(--color-muted); font-size: 13px; }
input, select, textarea { font: inherit; padding: 0.45rem 0.55rem; border: 1px solid var(--color-line); border-radius: 8px; }
.btn { border: none; border-radius: 8px; padding: 0.45rem 0.85rem; cursor: pointer; }
.btn.primary, .btn.sm { background: var(--color-primary); color: oklch(0.98 0.008 80); }
.btn.ghost { background: var(--color-card); border: 1px solid var(--color-line); }
.btn.sm { font-size: 13px; padding: 0.25rem 0.6rem; }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--color-line); }
.mono { font-family: ui-monospace, monospace; font-size: 12px; }
</style>
