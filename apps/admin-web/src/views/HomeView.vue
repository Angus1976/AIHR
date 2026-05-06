<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api, getToken } from '../lib/api';

type DashboardSummary = {
  jobs: { total: number; published: number };
  applications: {
    total: number;
    byStatus: Record<string, number>;
  };
  orders: { paid: number; revenueFen: number };
  refunds: { pending: number };
  partners: { pending: number };
  contracts: { signed: number };
  notifications: { unread: number };
};

const health = ref<unknown>(null);
const err = ref<string | null>(null);
const summary = ref<DashboardSummary | null>(null);
const summaryErr = ref('');

const flow = [
  { key: 'SUBMITTED', label: '新投递' },
  { key: 'REVIEWING', label: '筛选中' },
  { key: 'INTERVIEW', label: '面试' },
  { key: 'OFFER', label: 'Offer' },
];

function yuan(fen: number) {
  return (fen / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

onMounted(async () => {
  try {
    const res = await fetch('/v1/health');
    health.value = await res.json();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '请求失败';
  }
  if (getToken()) {
    try {
      summary.value = await api<DashboardSummary>('/dashboard/summary');
    } catch (e) {
      summaryErr.value = e instanceof Error ? e.message : '总览数据加载失败';
    }
  }
});
</script>

<template>
  <div class="page">
    <section class="hero card">
      <div>
        <div class="eyebrow">Talent Service OS</div>
        <h1>把岗位、候选人、协议与收费节点放到同一个运营现场。</h1>
        <p class="lead">
          职AI通管理端面向就业服务与平台运营，强调可信、留痕、可配置，而不是堆砌技术标签。
        </p>
      </div>
      <div class="health" :class="{ bad: err }">
        <div class="label">API Health</div>
        <strong>{{ err ? '需要检查' : '运行中' }}</strong>
        <pre>{{ err || JSON.stringify(health, null, 2) }}</pre>
      </div>
    </section>

    <section class="grid">
      <article class="card metric">
        <span>Published Jobs</span>
        <strong>{{ summary?.jobs.published ?? '—' }}</strong>
        <p>已发布岗位 / 总岗位 {{ summary?.jobs.total ?? '—' }}</p>
      </article>
      <article class="card metric">
        <span>Applications</span>
        <strong>{{ summary?.applications.total ?? '—' }}</strong>
        <p>投递总量，已接入匹配排序与状态流转。</p>
      </article>
      <article class="card metric">
        <span>Revenue</span>
        <strong>{{ summary ? `¥${yuan(summary.orders.revenueFen)}` : '—' }}</strong>
        <p>已支付订单 {{ summary?.orders.paid ?? '—' }} 笔。</p>
      </article>
      <article class="card metric">
        <span>Pending</span>
        <strong>{{ summary?.refunds.pending ?? '—' }}</strong>
        <p>待处理退款申请。</p>
      </article>
      <article class="card metric">
        <span>Partners</span>
        <strong>{{ summary?.partners.pending ?? '—' }}</strong>
        <p>待审核伙伴入驻。</p>
      </article>
      <article class="card metric">
        <span>Contracts</span>
        <strong>{{ summary?.contracts.signed ?? '—' }}</strong>
        <p>已完成签署占位的协议。</p>
      </article>
    </section>

    <section class="card pipeline">
      <div class="section-head">
        <div>
          <div class="eyebrow">Candidate Pipeline</div>
          <h2>候选人流转</h2>
        </div>
        <p v-if="summaryErr" class="bad">{{ summaryErr }}</p>
      </div>
      <div class="steps">
        <div v-for="item in flow" :key="item.key" class="step">
          <span>{{ item.label }}</span>
          <strong>{{ summary?.applications.byStatus[item.key] ?? 0 }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page h1 {
  margin: 0;
  max-width: 760px;
  font-size: clamp(2.2rem, 4vw, 4.6rem);
  line-height: 0.98;
  text-wrap: pretty;
}
.lead {
  color: var(--color-muted);
  margin: 1rem 0 0;
  font-size: 1.05rem;
  line-height: 1.8;
  text-wrap: pretty;
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 2rem;
  align-items: end;
  padding: clamp(2rem, 5vw, 4rem);
  min-height: 420px;
  overflow: hidden;
  position: relative;
}
.hero::after {
  content: '';
  position: absolute;
  right: -120px;
  top: -120px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  opacity: 0.7;
  filter: blur(6px);
}
.eyebrow {
  color: var(--color-accent);
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin-bottom: 1rem;
  text-transform: uppercase;
}
.health {
  position: relative;
  z-index: 1;
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: oklch(0.99 0.006 78 / 0.82);
}
.health strong {
  display: block;
  font-size: 1.35rem;
  color: var(--color-primary-strong);
  margin-bottom: 0.75rem;
}
.health.bad strong {
  color: #9a4b22;
}
.label {
  font-size: 12px;
  color: var(--color-muted);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
pre {
  margin: 0;
  font-size: 13px;
  white-space: pre-wrap;
  color: var(--color-muted);
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.metric {
  padding: 1.25rem;
}
.metric span {
  font-family: Sora, 'Noto Sans SC', sans-serif;
  color: var(--color-accent);
  font-size: 0.8rem;
  font-weight: 800;
}
.metric strong {
  display: block;
  margin-top: 0.75rem;
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  letter-spacing: -0.04em;
  color: var(--color-primary-strong);
}
.metric p {
  margin: 0.5rem 0 0;
  color: var(--color-muted);
  line-height: 1.65;
}
.pipeline {
  margin-top: 1rem;
  padding: 1.5rem;
}
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.section-head h2 {
  margin: 0;
  font-size: 1.25rem;
}
.bad {
  color: var(--color-warning);
  margin: 0;
}
.steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}
.step {
  padding: 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: oklch(0.99 0.006 78 / 0.62);
}
.step span {
  color: var(--color-muted);
  font-size: 13px;
}
.step strong {
  display: block;
  margin-top: 0.4rem;
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-size: 1.8rem;
  color: var(--color-primary-strong);
}
</style>
