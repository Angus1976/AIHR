<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { setToken } from '../lib/api';
import { refreshTenantBrandFromApi } from '../lib/tenant-brand';

const router = useRouter();
const route = useRoute();

const email = ref('admin@example.com');
const password = ref('ChangeMe123!');
const err = ref('');
const loading = ref(false);

const LOGIN_TIMEOUT_MS = 30_000;

async function submit() {
  err.value = '';
  loading.value = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);
  try {
    const res = await fetch('/v1/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value,
      }),
      signal: controller.signal,
    });
    const data = (await res.json()) as {
      accessToken?: string;
      message?: string | string[];
    };
    if (!res.ok) {
      const m = data.message;
      err.value =
        typeof m === 'string' ? m : Array.isArray(m) ? m.join('; ') : '登录失败';
      return;
    }
    if (!data.accessToken) {
      err.value = '响应缺少 accessToken';
      return;
    }
    setToken(data.accessToken);
    await refreshTenantBrandFromApi();
    const redirect = route.query.redirect;
    await router.replace(
      typeof redirect === 'string' && redirect.startsWith('/')
        ? redirect
        : '/jobs',
    );
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      err.value = '登录请求超时，请检查网络或 API 是否可达';
    } else {
      err.value = e instanceof Error ? e.message : '网络错误';
    }
  } finally {
    clearTimeout(timer);
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <section class="login-shell card">
      <div class="intro">
        <div class="eyebrow">Operations Access</div>
        <h1>登录人才服务运营台</h1>
        <p class="muted">
          用于岗位代发布、候选人流转、服务付费、协议与退款审核等关键操作。
        </p>
        <div class="proof">
          <span>岗位</span>
          <span>匹配</span>
          <span>协议</span>
          <span>审计</span>
        </div>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label>
          <span>邮箱</span>
          <input v-model="email" type="email" autocomplete="username" required />
        </label>
        <label>
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <p v-if="err" class="err">{{ err }}</p>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? '登录中…' : '进入运营台' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.page {
  min-height: calc(100vh - 4rem);
  display: grid;
  align-items: center;
}
.login-shell {
  max-width: 980px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 380px;
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  position: relative;
  overflow: hidden;
}
.login-shell::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  right: -120px;
  bottom: -140px;
  background: var(--color-accent-soft);
}
.intro,
.login-form {
  position: relative;
  z-index: 1;
}
.eyebrow {
  color: var(--color-accent);
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 0.9rem;
}
.page h1 {
  margin: 0;
  max-width: 560px;
  font-size: clamp(2.1rem, 4vw, 4rem);
  line-height: 1;
  text-wrap: pretty;
}
.muted {
  color: var(--color-muted);
  margin: 1rem 0 0;
  font-size: 15px;
  line-height: 1.75;
  max-width: 520px;
}
.proof {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2rem;
}
.proof span {
  padding: 0.42rem 0.7rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: oklch(0.99 0.006 78 / 0.66);
  color: var(--color-primary-strong);
  font-size: 13px;
  font-weight: 700;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: center;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 13px;
  color: var(--color-muted);
}
input {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  font-size: 15px;
}
.err {
  color: var(--color-warning);
  font-size: 13px;
  margin: 0;
}
.btn {
  background:
    linear-gradient(180deg, oklch(0.36 0.065 158), var(--color-primary-strong));
  color: oklch(0.98 0.008 80);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(35, 62, 49, 0.18);
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
@media (max-width: 760px) {
  .login-shell {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
