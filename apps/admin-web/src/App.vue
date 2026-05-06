<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { refreshTenantBrandFromApi, tenantBrand } from './lib/tenant-brand';

const logoBroken = ref(false);

watch(
  () => tenantBrand.logoUrl,
  () => {
    logoBroken.value = false;
  },
);

const brandMarkChar = computed(() => {
  const n = tenantBrand.name.trim();
  return n ? n.slice(0, 1) : '职';
});

onMounted(() => {
  void refreshTenantBrandFromApi();
});
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <img
          v-if="tenantBrand.logoUrl && !logoBroken"
          :src="tenantBrand.logoUrl"
          class="brand-logo"
          alt=""
          @error="logoBroken = true"
        />
        <span v-else class="brand-mark">{{ brandMarkChar }}</span>
        <div class="brand-text">
          <div class="brand-title">{{ tenantBrand.name }}</div>
          <div class="brand-sub">{{ tenantBrand.subtitle }}</div>
        </div>
      </div>
      <nav class="nav">
        <RouterLink to="/">总览</RouterLink>
        <RouterLink to="/users">用户管理</RouterLink>
        <RouterLink to="/enterprises">企业管理</RouterLink>
        <RouterLink to="/jobs">岗位代发布</RouterLink>
        <RouterLink to="/service-plans">服务计划</RouterLink>
        <RouterLink to="/orders">订单</RouterLink>
        <RouterLink to="/products">服务产品</RouterLink>
        <RouterLink to="/partners">伙伴审核</RouterLink>
        <RouterLink to="/compliance">合规模板</RouterLink>
        <RouterLink to="/contracts">合同签章</RouterLink>
        <RouterLink to="/login">登录</RouterLink>
        <RouterLink to="/ai-panel">AI 配置</RouterLink>
        <RouterLink to="/audit-logs">审计日志</RouterLink>
        <RouterLink to="/settings">租户品牌</RouterLink>
        <RouterLink to="/simulation">完整模拟</RouterLink>
      </nav>
    </aside>
    <main class="main">
      <RouterView v-slot="{ Component }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  max-width: 100%;
  color: var(--color-text);
}
.sidebar {
  position: sticky;
  top: 0;
  flex: 0 0 268px;
  width: 268px;
  min-width: 0;
  height: 100vh;
  padding: 1.4rem 1rem;
  background:
    linear-gradient(180deg, oklch(0.24 0.05 154), oklch(0.18 0.035 130)),
    var(--color-primary-strong);
  color: oklch(0.96 0.016 80);
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
  border-right: 1px solid oklch(0.90 0.02 90 / 0.18);
  box-shadow: 18px 0 60px rgba(33, 44, 31, 0.16);
}
.brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.35rem 0.5rem;
  min-width: 0;
}
.brand-text {
  min-width: 0;
  flex: 1;
}
.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  object-fit: contain;
  background: oklch(0.98 0.008 80 / 0.96);
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px oklch(0.90 0.02 90 / 0.35);
}
.brand-mark {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background:
    linear-gradient(135deg, var(--color-accent), oklch(0.78 0.08 82));
  color: var(--color-primary-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
  font-size: 1.05rem;
  line-height: 1;
}
.brand-title {
  font-family: Sora, 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-weight: 800;
  letter-spacing: 0.02em;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.brand-sub {
  font-size: 12px;
  opacity: 0.72;
  margin-top: 2px;
  overflow-wrap: anywhere;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding-bottom: 0.5rem;
  margin-right: -0.25rem;
  padding-right: 0.25rem;
}
.nav a {
  color: oklch(0.88 0.018 88);
  text-decoration: none;
  padding: 0.68rem 0.78rem;
  border-radius: 12px;
  font-size: 14px;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  overflow-wrap: anywhere;
}
.nav a.router-link-active {
  background: oklch(0.94 0.018 80 / 0.13);
  color: oklch(0.985 0.008 80);
  border-color: oklch(0.94 0.018 80 / 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.nav a:hover {
  background: oklch(0.94 0.018 80 / 0.08);
}
.main {
  flex: 1;
  padding: 2.25rem 2.5rem 3rem;
  max-width: 1520px;
  min-width: 0;
  width: 100%;
}
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.12s ease;
}
.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    position: relative;
    width: 100%;
    height: auto;
    padding: 1rem;
  }
  .brand {
    margin-bottom: 0.25rem;
  }
  .nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.45rem;
  }
  .nav a {
    padding: 0.5rem 0.62rem;
  }
  .main {
    padding: 1.25rem 1rem 2rem;
  }
}
</style>
