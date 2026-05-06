<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, clearToken } from '../lib/api';

type Row = {
  id: string;
  status: string;
  pitch: string | null;
  createdAt: string;
  seeker: {
    id: string;
    displayName: string;
    phone: string | null;
    email: string | null;
  };
  match?: {
    score: number;
    profileFilled: boolean;
    matchedTokens: string[];
    matchedTokenCount: number;
  };
};

const route = useRoute();
const router = useRouter();
const rows = ref<Row[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const jobId = ref('');
const statuses = ['SUBMITTED', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];

async function load(id: string) {
  if (!id) return;
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<Row[]>(`/jobs/${id}/matches`);
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function updateStatus(row: Row, status: string) {
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/jobs/applications/${row.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    msg.value = '状态已更新';
    await load(jobId.value);
  } catch (e) {
    err.value = e instanceof Error ? e.message : '更新失败';
  } finally {
    loading.value = false;
  }
}

async function pushInterview(row: Row) {
  err.value = '';
  msg.value = '';
  if (!jobId.value || !row.seeker?.id) return;
  loading.value = true;
  try {
    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    await api('/interview-opportunities', {
      method: 'POST',
      body: JSON.stringify({
        jobPostingId: jobId.value,
        seekerUserId: row.seeker.id,
        scheduledAt,
        note: '就业老师从投递列表推送面试机会',
      }),
    });
    msg.value = '面试机会已推送给求职者';
    await load(jobId.value);
  } catch (e) {
    err.value = e instanceof Error ? e.message : '推送失败';
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.params.jobId,
  (id) => {
    jobId.value = typeof id === 'string' ? id : '';
    void load(jobId.value);
  },
  { immediate: true },
);

function logout() {
  clearToken();
  void router.push('/login');
}

</script>

<template>
  <div class="page">
    <div class="head">
      <h1>岗位投递</h1>
      <div class="actions">
        <button type="button" class="btn ghost" @click="router.push('/jobs')">
          返回岗位
        </button>
        <button type="button" class="link" @click="logout">退出</button>
      </div>
    </div>
    <p class="muted">岗位 ID：{{ jobId }}</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>
    <p v-if="!rows.length && !loading" class="muted">暂无投递记录。</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>求职者</th>
          <th>手机</th>
          <th>邮箱</th>
          <th>匹配</th>
          <th>状态</th>
          <th>流转</th>
          <th>面试</th>
          <th>留言</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td>{{ r.seeker?.displayName ?? '—' }}</td>
          <td>{{ r.seeker?.phone ?? '—' }}</td>
          <td>{{ r.seeker?.email ?? '—' }}</td>
          <td>
            <div class="score">{{ Math.round((r.match?.score ?? 0) * 1000) / 10 }}%</div>
            <div class="small muted">
              {{ r.match?.profileFilled ? `命中 ${r.match?.matchedTokenCount ?? 0}` : '档案未完善' }}
            </div>
          </td>
          <td>{{ r.status }}</td>
          <td>
            <select
              class="status-select"
              :disabled="loading"
              :value="r.status"
              @change="updateStatus(r, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn sm" :disabled="loading" @click="pushInterview(r)">
              推送面试
            </button>
          </td>
          <td class="pitch">{{ r.pitch ?? '—' }}</td>
          <td class="small muted">{{ r.createdAt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.bad {
  color: var(--color-warning);
}
.ok {
  color: var(--color-success);
  font-size: 14px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: var(--color-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.table th,
.table td {
  text-align: left;
  padding: 0.5rem 0.55rem;
  border-bottom: 1px solid var(--color-line);
}
.pitch {
  max-width: 220px;
  word-break: break-word;
}
.status-select {
  font-size: 13px;
  padding: 0.25rem 0.35rem;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  background: var(--color-card);
}
.score {
  color: var(--color-accent);
  font-weight: 700;
}
.small {
  font-size: 12px;
}
.btn.ghost {
  background: var(--color-card);
  border: 1px solid var(--color-line);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}
.link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}
</style>
