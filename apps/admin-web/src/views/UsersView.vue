<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type UserRow = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  role: string;
  updatedAt: string;
  jobSeekerProfile?: {
    headline: string | null;
    skillsText: string | null;
    updatedAt: string;
  } | null;
  _count?: { jobApplications: number; orders: number };
};

type JobSeekerProfile = {
  id: string;
  headline: string | null;
  skillsText: string | null;
  resumeMarkdown: string | null;
};

const roles = ['ADMIN', 'TEACHER', 'PARTNER', 'JOB_SEEKER', 'ENTERPRISE_USER'];
const rows = ref<UserRow[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const roleFilter = ref('');
const editingId = ref('');
const profileUser = ref<UserRow | null>(null);
const form = ref({
  displayName: '',
  email: '',
  phone: '',
  role: 'TEACHER',
  password: '',
});
const profileForm = ref({
  headline: '',
  skillsText: '',
  resumeMarkdown: '',
});

async function load() {
  err.value = '';
  loading.value = true;
  try {
    rows.value = await api<UserRow[]>(
      roleFilter.value ? `/users?role=${encodeURIComponent(roleFilter.value)}` : '/users',
    );
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

function reset() {
  editingId.value = '';
  form.value = {
    displayName: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    password: '',
  };
}

function edit(row: UserRow) {
  editingId.value = row.id;
  form.value = {
    displayName: row.displayName,
    email: row.email ?? '',
    phone: row.phone ?? '',
    role: row.role,
    password: '',
  };
}

async function editProfile(row: UserRow) {
  err.value = '';
  msg.value = '';
  profileUser.value = row;
  profileForm.value = {
    headline: '',
    skillsText: '',
    resumeMarkdown: '',
  };
  loading.value = true;
  try {
    const profile = await api<JobSeekerProfile | null>(`/users/${row.id}/profile`);
    profileForm.value = {
      headline: profile?.headline ?? '',
      skillsText: profile?.skillsText ?? '',
      resumeMarkdown: profile?.resumeMarkdown ?? '',
    };
  } catch (e) {
    err.value = e instanceof Error ? e.message : '档案加载失败';
  } finally {
    loading.value = false;
  }
}

function closeProfile() {
  profileUser.value = null;
  profileForm.value = { headline: '', skillsText: '', resumeMarkdown: '' };
}

async function saveProfile() {
  if (!profileUser.value) return;
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/users/${profileUser.value.id}/profile`, {
      method: 'PATCH',
      body: JSON.stringify({
        headline: profileForm.value.headline.trim(),
        skillsText: profileForm.value.skillsText.trim(),
        resumeMarkdown: profileForm.value.resumeMarkdown.trim(),
      }),
    });
    msg.value = '候选人档案已保存';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '档案保存失败';
  } finally {
    loading.value = false;
  }
}

async function save() {
  err.value = '';
  msg.value = '';
  if (!form.value.displayName.trim()) {
    err.value = '请填写显示名称';
    return;
  }
  loading.value = true;
  try {
    const payload = {
      displayName: form.value.displayName.trim(),
      email: form.value.email.trim() || undefined,
      phone: form.value.phone.trim() || undefined,
      role: form.value.role,
      password: form.value.password || undefined,
    };
    if (editingId.value) {
      await api(`/users/${editingId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      msg.value = '用户已更新';
    } else {
      await api('/users', { method: 'POST', body: JSON.stringify(payload) });
      msg.value = '用户已创建';
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
        <h1>用户管理</h1>
        <p class="muted">统一查看求职者、就业老师、伙伴与企业账号；管理员可创建运营账号并调整角色。</p>
      </div>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>

    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card editor">
      <div class="section-title">
        <h2>{{ editingId ? '编辑用户' : '创建用户' }}</h2>
        <button v-if="editingId" type="button" class="link" @click="reset">取消编辑</button>
      </div>
      <div class="grid">
        <label>显示名称 <input v-model="form.displayName" maxlength="80" /></label>
        <label>邮箱 <input v-model="form.email" type="email" maxlength="120" /></label>
        <label>手机 <input v-model="form.phone" maxlength="30" /></label>
        <label>
          角色
          <select v-model="form.role">
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </label>
        <label>
          密码
          <input v-model="form.password" type="password" maxlength="80" placeholder="创建老师/管理员或重置时填写" />
        </label>
      </div>
      <button type="button" class="btn primary" :disabled="loading" @click="save">
        {{ editingId ? '保存用户' : '创建用户' }}
      </button>
    </section>

    <section v-if="profileUser" class="card profile-editor">
      <div class="section-title">
        <div>
          <h2>候选人档案</h2>
          <p class="muted">{{ profileUser.displayName }} · {{ profileUser.email || profileUser.phone || profileUser.id }}</p>
        </div>
        <button type="button" class="link" @click="closeProfile">关闭</button>
      </div>
      <div class="profile-grid">
        <label>
          一句话亮点
          <input v-model="profileForm.headline" maxlength="200" placeholder="例如：3 年小程序前端，熟悉 Vue / Node" />
        </label>
        <label>
          技能关键词
          <textarea v-model="profileForm.skillsText" rows="5" maxlength="8000" placeholder="Vue、NestJS、PostgreSQL、客服沟通…" />
        </label>
        <label>
          简历/经历摘要
          <textarea v-model="profileForm.resumeMarkdown" rows="7" maxlength="32000" placeholder="可粘贴简历要点或 Markdown，供匹配排序使用" />
        </label>
      </div>
      <button type="button" class="btn primary" :disabled="loading" @click="saveProfile">
        保存候选人档案
      </button>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>用户列表</h2>
        <label class="filter">
          角色筛选
          <select v-model="roleFilter" @change="load">
            <option value="">全部</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </label>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>用户</th>
            <th>联系方式</th>
            <th>角色</th>
            <th>档案/业务</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <strong>{{ row.displayName }}</strong>
              <div class="mono muted">{{ row.id }}</div>
            </td>
            <td>
              <div>{{ row.email || '无邮箱' }}</div>
              <div class="muted">{{ row.phone || '无手机' }}</div>
            </td>
            <td><span class="role">{{ row.role }}</span></td>
            <td>
              <div>{{ row.jobSeekerProfile?.headline || '未填写档案亮点' }}</div>
              <div class="muted">
                投递 {{ row._count?.jobApplications ?? 0 }} · 订单 {{ row._count?.orders ?? 0 }}
              </div>
            </td>
            <td class="muted small">{{ row.updatedAt }}</td>
            <td class="ops">
              <button type="button" class="btn sm" @click="edit(row)">编辑</button>
              <button
                v-if="row.role === 'JOB_SEEKER'"
                type="button"
                class="btn ghost"
                @click="editProfile(row)"
              >
                档案
              </button>
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
.profile-editor {
  margin-bottom: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}
.profile-grid {
  display: grid;
  grid-template-columns: minmax(240px, 0.8fr) minmax(260px, 1fr) minmax(300px, 1.2fr);
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
.filter {
  min-width: 180px;
}
input,
select,
textarea {
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  font-size: 14px;
  font: inherit;
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
.role {
  display: inline-flex;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: var(--color-bg-deep);
  color: var(--color-primary-strong);
  font-size: 12px;
  font-weight: 700;
}
@media (max-width: 1180px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
.ops {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
</style>
