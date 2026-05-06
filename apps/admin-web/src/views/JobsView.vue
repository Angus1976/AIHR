<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api, clearToken } from '../lib/api';

type Enterprise = {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone?: string | null;
};

type Job = {
  id: string;
  title: string;
  status: string;
  enterpriseId: string;
  publishedAt: string | null;
  enterprise: { name: string };
  _count?: { applications: number };
};

const router = useRouter();
const enterprises = ref<Enterprise[]>([]);
const jobs = ref<Job[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);

const form = ref({
  enterpriseId: '',
  title: '',
  jdMarkdown: '',
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    enterprises.value = await api<Enterprise[]>('/enterprises');
    jobs.value = await api<Job[]>('/jobs');
    if (!form.value.enterpriseId && enterprises.value.length) {
      form.value.enterpriseId = enterprises.value[0].id;
    }
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function createJob() {
  err.value = '';
  msg.value = '';
  if (!form.value.enterpriseId || !form.value.title.trim()) {
    err.value = '请选择企业并填写岗位标题';
    return;
  }
  loading.value = true;
  try {
    await api('/jobs', {
      method: 'POST',
      body: JSON.stringify({
        enterpriseId: form.value.enterpriseId,
        title: form.value.title.trim(),
        jdMarkdown: form.value.jdMarkdown.trim() || undefined,
      }),
    });
    form.value.title = '';
    form.value.jdMarkdown = '';
    msg.value = '已创建草稿';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '创建失败';
  } finally {
    loading.value = false;
  }
}

async function publish(id: string) {
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/jobs/${id}/publish`, { method: 'POST' });
    msg.value = '已发布';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '发布失败';
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
      <h1>岗位代发布</h1>
      <button type="button" class="link" @click="logout">退出登录</button>
    </div>
    <p class="muted">平台方代替企业维护 JD：先存草稿，确认后再发布。</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card">
      <h2>新建草稿</h2>
      <div class="row">
        <label>
          企业
          <select v-model="form.enterpriseId" required>
            <option disabled value="">请选择</option>
            <option v-for="e in enterprises" :key="e.id" :value="e.id">
              {{ e.name }}
            </option>
          </select>
        </label>
      </div>
      <label>
        岗位标题
        <input v-model="form.title" type="text" maxlength="200" placeholder="例如：前端工程师" />
      </label>
      <label>
        JD（Markdown，可选）
        <textarea v-model="form.jdMarkdown" rows="6" placeholder="岗位职责与要求…" />
      </label>
      <button type="button" class="btn primary" :disabled="loading" @click="createJob">
        保存草稿
      </button>
    </section>

    <section class="card">
      <h2>企业投递汇总</h2>
      <p v-if="!enterprises.length && !loading" class="muted">
        暂无企业，请先在后端 seed 或数据库中维护企业。
      </p>
      <div v-else class="enterprise-grid">
        <RouterLink
          v-for="e in enterprises"
          :key="e.id"
          class="enterprise-card"
          :to="`/enterprise-applications/${e.id}`"
        >
          <strong>{{ e.name }}</strong>
          <span>{{ e.contactEmail || e.contactPhone || '暂无联系人信息' }}</span>
        </RouterLink>
      </div>
    </section>

    <section class="card">
      <h2>岗位列表</h2>
      <p v-if="!jobs.length && !loading" class="muted">暂无岗位，请先创建草稿。</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>企业</th>
            <th>投递</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in jobs" :key="j.id">
            <td>{{ j.title }}</td>
            <td>{{ j.enterprise?.name ?? '—' }}</td>
            <td>
              <RouterLink
                v-if="(j._count?.applications ?? 0) > 0 || j.status === 'PUBLISHED'"
                class="applink"
                :to="`/job-applications/${j.id}`"
              >
                {{ j._count?.applications ?? 0 }} 人
              </RouterLink>
              <span v-else class="muted">0</span>
            </td>
            <td>
              <span :class="j.status === 'PUBLISHED' ? 'tag pub' : 'tag'">{{
                j.status
              }}</span>
            </td>
            <td class="ops">
              <button
                v-if="j.status === 'DRAFT'"
                type="button"
                class="btn sm"
                :disabled="loading"
                @click="publish(j.id)"
              >
                发布
              </button>
              <RouterLink
                v-if="j.status === 'PUBLISHED'"
                class="btn sm linkish"
                :to="`/job-applications/${j.id}`"
              >
                投递列表
              </RouterLink>
              <span v-if="j.status !== 'DRAFT' && j.status !== 'PUBLISHED'" class="muted"
                >—</span
              >
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
.row {
  margin-bottom: 0.75rem;
}
.enterprise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.enterprise-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  color: var(--color-text);
  text-decoration: none;
}
.enterprise-card span {
  color: var(--color-muted);
  font-size: 13px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 13px;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
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
.btn.sm {
  padding: 0.25rem 0.6rem;
  font-size: 13px;
  background: var(--color-accent);
  color: oklch(0.98 0.008 80);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
.tag {
  font-size: 12px;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  background: var(--color-bg-deep);
}
.tag.pub {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.applink {
  color: var(--color-primary);
  font-weight: 600;
}
.ops {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
}
.linkish {
  text-decoration: none;
  display: inline-block;
}
</style>
