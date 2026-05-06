<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, clearToken } from '../lib/api';

type Product = {
  id: string;
  code: string;
  name: string;
  audience: string;
  orderKind: string;
  amountFen: number;
  description: string | null;
  enabled: boolean;
  sortOrder: number;
};

const router = useRouter();
const rows = ref<Product[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const form = ref({
  code: 'seeker-offer-deposit',
  name: '',
  audience: 'JOB_SEEKER',
  orderKind: 'SEEKER_SERVICE_FEE',
  amountFen: 99,
  description: '',
  sortOrder: 100,
  enabled: true,
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<Product[]>('/service-products');
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function save() {
  err.value = '';
  msg.value = '';
  if (!form.value.code.trim() || !form.value.name.trim()) {
    err.value = '请填写产品编码和名称';
    return;
  }
  loading.value = true;
  try {
    await api('/service-products', {
      method: 'POST',
      body: JSON.stringify({
        code: form.value.code.trim(),
        name: form.value.name.trim(),
        audience: form.value.audience,
        orderKind: form.value.orderKind,
        amountFen: Number(form.value.amountFen),
        description: form.value.description.trim() || undefined,
        sortOrder: Number(form.value.sortOrder),
        enabled: form.value.enabled,
      }),
    });
    msg.value = '已保存服务产品';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '保存失败';
  } finally {
    loading.value = false;
  }
}

function edit(row: Product) {
  form.value = {
    code: row.code,
    name: row.name,
    audience: row.audience,
    orderKind: row.orderKind,
    amountFen: row.amountFen,
    description: row.description ?? '',
    sortOrder: row.sortOrder,
    enabled: row.enabled,
  };
}

function logout() {
  clearToken();
  void router.push('/login');
}

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="page">
    <div class="head">
      <h1>服务产品与定价</h1>
      <div class="actions">
        <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
        <button type="button" class="link" @click="logout">退出</button>
      </div>
    </div>
    <p class="muted">用于求职者定金、企业订阅等可配置收费项；小程序按已启用产品展示。</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card">
      <h2>新增 / 编辑</h2>
      <div class="grid">
        <label>
          编码
          <input v-model="form.code" maxlength="64" placeholder="seeker-offer-deposit" />
        </label>
        <label>
          名称
          <input v-model="form.name" maxlength="120" placeholder="求职服务 · offer 后定金" />
        </label>
        <label>
          受众
          <select v-model="form.audience">
            <option value="JOB_SEEKER">JOB_SEEKER</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
            <option value="PARTNER">PARTNER</option>
          </select>
        </label>
        <label>
          订单类型
          <select v-model="form.orderKind">
            <option value="SEEKER_SERVICE_FEE">SEEKER_SERVICE_FEE</option>
            <option value="ENTERPRISE_SUBSCRIPTION">ENTERPRISE_SUBSCRIPTION</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>
        <label>
          金额（分）
          <input v-model.number="form.amountFen" type="number" min="1" />
        </label>
        <label>
          排序
          <input v-model.number="form.sortOrder" type="number" min="0" />
        </label>
      </div>
      <label>
        描述
        <textarea v-model="form.description" rows="3" maxlength="500" />
      </label>
      <label class="check">
        <input v-model="form.enabled" type="checkbox" />
        启用
      </label>
      <button type="button" class="btn primary" :disabled="loading" @click="save">保存</button>
    </section>

    <section class="card">
      <h2>产品列表</h2>
      <table class="table">
        <thead>
          <tr>
            <th>编码</th>
            <th>名称</th>
            <th>受众</th>
            <th>订单类型</th>
            <th>金额(分)</th>
            <th>启用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td class="mono">{{ r.code }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.audience }}</td>
            <td>{{ r.orderKind }}</td>
            <td>{{ r.amountFen }}</td>
            <td>{{ r.enabled ? '是' : '否' }}</td>
            <td>
              <button type="button" class="btn sm" @click="edit(r)">编辑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.page h1 {
  margin: 0;
}
.muted {
  color: var(--color-muted);
  font-size: 14px;
}
.ok {
  color: var(--color-success);
  font-size: 14px;
}
.bad {
  color: var(--color-warning);
  font-size: 14px;
}
.card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1.25rem;
}
.card h2 {
  margin: 0 0 1rem;
  font-size: 1.05rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 13px;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
}
.check {
  flex-direction: row;
  align-items: center;
}
input,
select,
textarea {
  font-size: 14px;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--color-line);
  border-radius: 8px;
}
.btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 14px;
}
.btn.primary {
  background: var(--color-primary);
  color: oklch(0.98 0.008 80);
}
.btn.ghost {
  background: var(--color-card);
  border: 1px solid var(--color-line);
}
.btn.sm {
  padding: 0.25rem 0.6rem;
  font-size: 13px;
  background: var(--color-accent);
  color: oklch(0.98 0.008 80);
}
.link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th,
.table td {
  text-align: left;
  padding: 0.5rem 0.4rem;
  border-bottom: 1px solid var(--color-line);
}
.mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
}
</style>
