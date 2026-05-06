<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type AuditRow = {
  id: string;
  action: string;
  actorType: string;
  onBehalfOfType: string;
  onBehalfOfId: string;
  metadata: unknown;
  createdAt: string;
  performedBy?: {
    displayName: string;
    email: string | null;
    phone: string | null;
    role: string;
  } | null;
};

const rows = ref<AuditRow[]>([]);
const err = ref('');
const loading = ref(false);
const action = ref('');

async function load() {
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<AuditRow[]>(
      action.value.trim() ? `/audit-logs?action=${encodeURIComponent(action.value.trim())}` : '/audit-logs',
    );
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
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
        <h1>审计日志</h1>
        <p class="muted">最近 300 条关键操作留痕，覆盖岗位、企业、支付、合同、AI 配置等动作。</p>
      </div>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>

    <section class="card filter">
      <label>
        按 action 过滤
        <input v-model="action" placeholder="例如：JOB_PUBLISH" @keyup.enter="load" />
      </label>
      <button type="button" class="btn primary" :disabled="loading" @click="load">查询</button>
    </section>

    <p v-if="err" class="bad">{{ err }}</p>
    <section class="card">
      <table class="table">
        <thead>
          <tr>
            <th>动作</th>
            <th>操作人</th>
            <th>对象</th>
            <th>时间</th>
            <th>元数据</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <strong>{{ row.action }}</strong>
              <div class="muted">{{ row.actorType }}</div>
            </td>
            <td>
              {{ row.performedBy?.displayName ?? 'SYSTEM' }}
              <div class="muted">{{ row.performedBy?.role ?? '—' }}</div>
            </td>
            <td>
              {{ row.onBehalfOfType }}
              <div class="mono muted">{{ row.onBehalfOfId }}</div>
            </td>
            <td class="muted small">{{ row.createdAt }}</td>
            <td><pre>{{ JSON.stringify(row.metadata, null, 2) }}</pre></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.page h1 { margin: 0; }
.muted { color: var(--color-muted); font-size: 14px; }
.bad { color: var(--color-warning); }
.filter {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  margin: 1rem 0;
  padding: 1rem 1.2rem;
  box-sizing: border-box;
}
label { flex: 1; display: flex; flex-direction: column; gap: 0.45rem; color: var(--color-muted); font-size: 13px; min-width: 0; }
input { padding: 0.5rem 0.6rem; border: 1px solid var(--color-line); border-radius: 10px; }
.btn { border: none; border-radius: 10px; padding: 0.5rem 0.9rem; cursor: pointer; }
.btn.primary { background: var(--color-primary); color: oklch(0.98 0.008 80); }
.btn.ghost { background: var(--color-card); border: 1px solid var(--color-line); color: var(--color-primary-strong); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { text-align: left; padding: 0.65rem 0.72rem; border-bottom: 1px solid var(--color-line); vertical-align: top; }
.table td:first-child strong { word-break: break-all; overflow-wrap: anywhere; }
.mono { font-family: ui-monospace, monospace; font-size: 12px; }
.small { font-size: 12px; }
</style>
