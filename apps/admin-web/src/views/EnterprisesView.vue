<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../lib/api';

type Enterprise = {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  updatedAt: string;
};

const rows = ref<Enterprise[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const editingId = ref('');
const form = ref({
  name: '',
  contactEmail: '',
  contactPhone: '',
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<Enterprise[]>('/enterprises');
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

function edit(row: Enterprise) {
  editingId.value = row.id;
  form.value = {
    name: row.name,
    contactEmail: row.contactEmail ?? '',
    contactPhone: row.contactPhone ?? '',
  };
}

function reset() {
  editingId.value = '';
  form.value = { name: '', contactEmail: '', contactPhone: '' };
}

async function save() {
  err.value = '';
  msg.value = '';
  if (!form.value.name.trim()) {
    err.value = '请填写企业名称';
    return;
  }
  loading.value = true;
  try {
    const body = JSON.stringify({
      name: form.value.name.trim(),
      contactEmail: form.value.contactEmail.trim() || undefined,
      contactPhone: form.value.contactPhone.trim() || undefined,
    });
    if (editingId.value) {
      await api(`/enterprises/${editingId.value}`, { method: 'PATCH', body });
      msg.value = '企业资料已更新';
    } else {
      await api('/enterprises', { method: 'POST', body });
      msg.value = '企业已创建';
    }
    reset();
    await load();
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
        <h1>企业管理</h1>
        <p class="muted">维护企业联系人资料，为岗位代发布、短信确认、投递汇总提供基础数据。</p>
      </div>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>

    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card editor">
      <div class="section-title">
        <h2>{{ editingId ? '编辑企业' : '新增企业' }}</h2>
        <button v-if="editingId" type="button" class="link" @click="reset">取消编辑</button>
      </div>
      <div class="grid">
        <label>
          企业名称
          <input v-model="form.name" maxlength="120" placeholder="例如：示例科技有限公司" />
        </label>
        <label>
          联系邮箱
          <input v-model="form.contactEmail" type="email" maxlength="120" placeholder="hr@example.com" />
        </label>
        <label>
          联系手机
          <input v-model="form.contactPhone" maxlength="30" placeholder="13800000000" />
        </label>
      </div>
      <button type="button" class="btn primary" :disabled="loading" @click="save">
        {{ editingId ? '保存修改' : '创建企业' }}
      </button>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>企业列表</h2>
        <span class="muted">{{ rows.length }} 家企业</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>企业</th>
            <th>联系人</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <strong>{{ row.name }}</strong>
              <div class="mono muted">{{ row.id }}</div>
            </td>
            <td>
              <div>{{ row.contactEmail || '未填写邮箱' }}</div>
              <div class="muted">{{ row.contactPhone || '未填写手机' }}</div>
            </td>
            <td class="muted small">{{ row.updatedAt }}</td>
            <td class="ops">
              <button type="button" class="btn sm" @click="edit(row)">编辑</button>
              <RouterLink class="btn ghost linkish" :to="`/enterprise-applications/${row.id}`">
                投递汇总
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.head,
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.page h1,
.section-title h2 {
  margin: 0;
}
.muted {
  color: var(--color-muted);
  font-size: 14px;
}
.ok {
  color: var(--color-success);
}
.bad {
  color: var(--color-warning);
}
.editor {
  margin: 1rem 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--color-muted);
  font-size: 13px;
}
input {
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  font-size: 14px;
}
.btn {
  border: none;
  border-radius: 10px;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  font-size: 14px;
}
.btn.primary,
.btn.sm {
  background: var(--color-primary);
  color: oklch(0.98 0.008 80);
}
.btn.ghost {
  background: var(--color-card);
  border: 1px solid var(--color-line);
  color: var(--color-primary-strong);
}
.link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 1rem;
}
.table th,
.table td {
  text-align: left;
  padding: 0.6rem 0.55rem;
  border-bottom: 1px solid var(--color-line);
  vertical-align: top;
}
.mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
}
.small {
  font-size: 12px;
}
.ops {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.linkish {
  text-decoration: none;
  display: inline-block;
}
</style>
