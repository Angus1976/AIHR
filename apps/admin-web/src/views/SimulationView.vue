<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';

type Summary = {
  jobs: { total: number; published: number };
  applications: { total: number; byStatus: Record<string, number> };
  orders: { paid: number; revenueFen: number };
  refunds: { pending: number };
  partners: { pending: number };
  contracts: { signed: number };
  notifications: { unread: number };
};

type Job = { id: string; title: string; status: string; enterprise?: { name: string }; _count?: { applications: number } };
type User = { id: string; displayName: string; role: string; jobSeekerProfile?: { headline: string | null } | null };
type Order = { id: string; description: string | null; status: string; amountFen: number; payer?: { displayName: string } };
type Contract = { id: string; title: string; status: string; signatureRef: string | null; user?: { displayName: string } };
type Refund = { id: string; status: string; amountFen: number; reason: string | null; requestedBy?: { displayName: string } };
type Partner = { id: string; orgName: string; status: string; category: string };
type Audit = { id: string; action: string; createdAt: string; metadata: Record<string, unknown> | null };

const loading = ref(false);
const err = ref('');
const summary = ref<Summary | null>(null);
const jobs = ref<Job[]>([]);
const seekers = ref<User[]>([]);
const orders = ref<Order[]>([]);
const contracts = ref<Contract[]>([]);
const refunds = ref<Refund[]>([]);
const partners = ref<Partner[]>([]);
const audits = ref<Audit[]>([]);

const demoReady = computed(() => ({
  enterprise: jobs.value.some((j) => j.enterprise?.name?.includes('完整模拟')),
  candidates: seekers.value.some((u) => u.displayName.includes('陈一舟')),
  pipeline: summary.value ? summary.value.applications.total > 0 : false,
  payment: orders.value.some((o) => o.description?.includes('完整模拟')),
  contract: contracts.value.some((c) => c.title.includes('完整模拟') && c.status === 'SIGNED'),
  refund: refunds.value.some((r) => r.reason?.includes('完整模拟')),
  partner: partners.value.some((p) => p.orgName.includes('南山职业训练营')),
  audit: audits.value.length > 0,
}));

const steps = computed(() => [
  { key: 'enterprise', title: '企业与岗位', desc: '森禾科技、前端/就业顾问岗位', done: demoReady.value.enterprise },
  { key: 'candidates', title: '候选人档案', desc: '陈一舟、周若宁等候选人画像', done: demoReady.value.candidates },
  { key: 'pipeline', title: '投递流转', desc: '筛选、面试、Offer 状态完整出现', done: demoReady.value.pipeline },
  { key: 'payment', title: '订单收费', desc: 'offer 后定金与支付成功状态', done: demoReady.value.payment },
  { key: 'contract', title: '协议签署', desc: '服务协议签署占位与 hash 留痕', done: demoReady.value.contract },
  { key: 'refund', title: '退款审核', desc: '部分退款申请与审核状态', done: demoReady.value.refund },
  { key: 'partner', title: '伙伴入驻', desc: '培训机构提交并审核通过', done: demoReady.value.partner },
  { key: 'audit', title: '审计留痕', desc: '完整模拟写入 DEMO_SCENARIO_SEED', done: demoReady.value.audit },
]);

function yuan(fen: number) {
  return (fen / 100).toFixed(2);
}

async function load() {
  err.value = '';
  loading.value = true;
  try {
    const [s, j, u, o, c, r, p, a] = await Promise.all([
      api<Summary>('/dashboard/summary'),
      api<Job[]>('/jobs'),
      api<User[]>('/users?role=JOB_SEEKER'),
      api<Order[]>('/orders'),
      api<Contract[]>('/contracts'),
      api<Refund[]>('/orders/refund-requests'),
      api<Partner[]>('/partner-applications'),
      api<Audit[]>('/audit-logs?action=DEMO_SCENARIO_SEED'),
    ]);
    summary.value = s;
    jobs.value = j;
    seekers.value = u;
    orders.value = o;
    contracts.value = c;
    refunds.value = r;
    partners.value = p;
    audits.value = a;
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
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
    <section class="hero card">
      <div>
        <div class="eyebrow">End-to-End Simulation</div>
        <h1>完整业务模拟</h1>
        <p class="muted">
          用一套可重复执行的 demo 数据，把企业岗位、候选人、匹配、投递、订单、协议、退款、伙伴与审计串起来。
        </p>
      </div>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新模拟状态</button>
    </section>

    <p v-if="err" class="bad">{{ err }}</p>

    <section class="timeline">
      <article v-for="(step, i) in steps" :key="step.key" class="card step" :class="{ done: step.done }">
        <span class="index">{{ String(i + 1).padStart(2, '0') }}</span>
        <strong>{{ step.title }}</strong>
        <p>{{ step.desc }}</p>
        <em>{{ step.done ? '已就绪' : '待写入 demo 数据' }}</em>
      </article>
    </section>

    <section class="grid">
      <article class="card panel">
        <h2>运营指标</h2>
        <dl>
          <div><dt>岗位</dt><dd>{{ summary?.jobs.published ?? 0 }} / {{ summary?.jobs.total ?? 0 }}</dd></div>
          <div><dt>投递</dt><dd>{{ summary?.applications.total ?? 0 }}</dd></div>
          <div><dt>收入</dt><dd>¥{{ yuan(summary?.orders.revenueFen ?? 0) }}</dd></div>
          <div><dt>已签协议</dt><dd>{{ summary?.contracts.signed ?? 0 }}</dd></div>
        </dl>
      </article>

      <article class="card panel">
        <h2>核心对象</h2>
        <ul>
          <li v-for="job in jobs.slice(0, 4)" :key="job.id">
            {{ job.title }} <span>{{ job.enterprise?.name ?? '未知企业' }}</span>
          </li>
        </ul>
      </article>

      <article class="card panel">
        <h2>候选人</h2>
        <ul>
          <li v-for="user in seekers.slice(0, 5)" :key="user.id">
            {{ user.displayName }} <span>{{ user.jobSeekerProfile?.headline ?? '未填写档案' }}</span>
          </li>
        </ul>
      </article>

      <article class="card panel">
        <h2>支付 / 协议 / 退款</h2>
        <ul>
          <li v-for="order in orders.slice(0, 3)" :key="order.id">
            {{ order.description || '订单' }} <span>{{ order.status }} · ¥{{ yuan(order.amountFen) }}</span>
          </li>
          <li v-for="contract in contracts.slice(0, 2)" :key="contract.id">
            {{ contract.title }} <span>{{ contract.status }}</span>
          </li>
          <li v-for="refund in refunds.slice(0, 2)" :key="refund.id">
            退款 {{ refund.amountFen }} 分 <span>{{ refund.status }}</span>
          </li>
        </ul>
      </article>
    </section>

    <section class="card command">
      <h2>写入完整模拟数据</h2>
      <p class="muted">在 `apps/api` 目录加载根 `.env` 后执行：</p>
      <pre>set -a && . ../../.env && set +a && npm run prisma:demo</pre>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
  padding: 2rem;
  margin-bottom: 1rem;
}
.eyebrow {
  color: var(--color-accent);
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.page h1 {
  margin: 0.5rem 0;
  font-size: clamp(2.4rem, 4vw, 4.8rem);
  line-height: 0.95;
}
.muted {
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.7;
}
.bad {
  color: var(--color-warning);
}
.btn {
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.95rem;
  cursor: pointer;
}
.btn.ghost {
  background: var(--color-card);
  border: 1px solid var(--color-line);
  color: var(--color-primary-strong);
}
.timeline {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}
.step {
  padding: 1rem;
}
.step.done {
  background:
    linear-gradient(180deg, oklch(0.96 0.03 120 / 0.76), oklch(0.99 0.006 78 / 0.7)),
    var(--color-card) !important;
}
.index {
  color: var(--color-accent);
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-weight: 800;
}
.step strong {
  display: block;
  margin-top: 0.65rem;
  color: var(--color-primary-strong);
}
.step p {
  margin: 0.45rem 0;
  color: var(--color-muted);
  line-height: 1.6;
}
.step em {
  font-style: normal;
  color: var(--color-success);
  font-size: 13px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.panel {
  padding: 1.25rem;
}
.panel h2,
.command h2 {
  margin: 0 0 1rem;
}
dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
}
dt {
  color: var(--color-muted);
  font-size: 13px;
}
dd {
  margin: 0.25rem 0 0;
  color: var(--color-primary-strong);
  font-family: Sora, 'Noto Sans SC', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}
li {
  padding-bottom: 0.7rem;
  border-bottom: 1px solid var(--color-line);
}
li span {
  display: block;
  margin-top: 0.2rem;
  color: var(--color-muted);
  font-size: 13px;
}
.command {
  margin-top: 1rem;
  padding: 1.25rem;
}
pre {
  margin: 0.75rem 0 0;
  padding: 0.9rem;
  border-radius: 12px;
  white-space: pre-wrap;
}
</style>
