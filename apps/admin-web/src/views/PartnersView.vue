<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, clearToken } from '../lib/api';

type PartnerRow = {
  id: string;
  orgName: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  category: string;
  qualification: string | null;
  courseSummary: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  submittedBy?: { displayName: string; phone: string | null; email: string | null };
};

const router = useRouter();
const rows = ref<PartnerRow[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const statuses = ['SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED'];

async function load() {
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<PartnerRow[]>('/partner-applications');
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function review(row: PartnerRow, status: string) {
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/partner-applications/${row.id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    msg.value = '审核状态已更新';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '更新失败';
  } finally {
    loading.value = false;
  }
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
      <h1>伙伴入驻审核</h1>
      <div class="actions">
        <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
        <button type="button" class="link" @click="logout">退出</button>
      </div>
    </div>
    <p class="muted">培训机构、服务商等伙伴提交入驻后在此审核。</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>
    <p v-if="!rows.length && !loading" class="muted">暂无入驻申请。</p>

    <section v-for="r in rows" :key="r.id" class="card">
      <div class="topline">
        <div>
          <h2>{{ r.orgName }}</h2>
          <p class="muted">{{ r.category }} · {{ r.contactName }}</p>
        </div>
        <select
          class="status-select"
          :disabled="loading"
          :value="r.status"
          @change="review(r, ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="meta">
        <span>{{ r.contactPhone || '无手机' }}</span>
        <span>{{ r.contactEmail || '无邮箱' }}</span>
        <span>{{ r.createdAt }}</span>
      </div>
      <p v-if="r.qualification" class="body">{{ r.qualification }}</p>
      <p v-if="r.courseSummary" class="body">{{ r.courseSummary }}</p>
    </section>
  </div>
</template>

<style scoped>
.head,
.topline {
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
.page h1,
.card h2 {
  margin: 0;
}
.card h2 {
  font-size: 1.05rem;
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
.card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1rem;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--color-muted);
  font-size: 13px;
  margin: 0.75rem 0;
}
.body {
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 0.5rem 0 0;
  font-size: 14px;
}
.btn.ghost,
.status-select {
  background: var(--color-card);
  border: 1px solid var(--color-line);
  border-radius: 8px;
}
.btn.ghost {
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}
.status-select {
  padding: 0.35rem 0.45rem;
}
.link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}
</style>
