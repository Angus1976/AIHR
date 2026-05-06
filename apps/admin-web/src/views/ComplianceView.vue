<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type Template = {
  id: string;
  purpose: string;
  version: string;
  title: string;
  content: string;
  contentHash: string;
  enabled: boolean;
  createdAt: string;
};

const rows = ref<Template[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const form = ref({
  purpose: 'SERVICE_PAYMENT',
  version: 'mvp-2026-04',
  title: '',
  content: '',
  enabled: true,
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<Template[]>('/compliance/templates');
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function save() {
  err.value = '';
  msg.value = '';
  if (!form.value.title.trim() || !form.value.content.trim()) {
    err.value = '请填写标题和正文';
    return;
  }
  loading.value = true;
  try {
    await api('/compliance/templates', {
      method: 'POST',
      body: JSON.stringify({
        purpose: form.value.purpose.trim(),
        version: form.value.version.trim(),
        title: form.value.title.trim(),
        content: form.value.content,
        enabled: form.value.enabled,
      }),
    });
    msg.value = '合规模板已保存';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '保存失败';
  } finally {
    loading.value = false;
  }
}

function edit(row: Template) {
  form.value = {
    purpose: row.purpose,
    version: row.version,
    title: row.title,
    content: row.content,
    enabled: row.enabled,
  };
}

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="page">
    <div class="head">
      <h1>合规模板</h1>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>
    <p class="muted">用于隐私同意、服务协议、退款说明等版本化模板，正文会计算 SHA-256 存证。</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card">
      <h2>新增 / 编辑模板</h2>
      <div class="grid">
        <label>用途 <input v-model="form.purpose" /></label>
        <label>版本 <input v-model="form.version" /></label>
        <label>标题 <input v-model="form.title" /></label>
      </div>
      <label>正文 <textarea v-model="form.content" rows="8" /></label>
      <label class="check"><input v-model="form.enabled" type="checkbox" /> 启用</label>
      <button type="button" class="btn primary" :disabled="loading" @click="save">保存模板</button>
    </section>

    <section class="card">
      <h2>模板列表</h2>
      <table class="table">
        <thead>
          <tr>
            <th>用途</th>
            <th>版本</th>
            <th>标题</th>
            <th>Hash</th>
            <th>启用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td>{{ r.purpose }}</td>
            <td>{{ r.version }}</td>
            <td>{{ r.title }}</td>
            <td class="mono">{{ r.contentHash.slice(0, 16) }}…</td>
            <td>{{ r.enabled ? '是' : '否' }}</td>
            <td><button class="btn sm" type="button" @click="edit(r)">编辑</button></td>
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
.check { flex-direction: row; align-items: center; }
input, textarea { font: inherit; padding: 0.45rem 0.55rem; border: 1px solid var(--color-line); border-radius: 8px; }
.btn { border: none; border-radius: 8px; padding: 0.45rem 0.85rem; cursor: pointer; }
.btn.primary, .btn.sm { background: var(--color-primary); color: oklch(0.98 0.008 80); }
.btn.ghost { background: var(--color-card); border: 1px solid var(--color-line); }
.btn.sm { font-size: 13px; padding: 0.25rem 0.6rem; }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--color-line); }
.mono { font-family: ui-monospace, monospace; font-size: 12px; }
</style>
