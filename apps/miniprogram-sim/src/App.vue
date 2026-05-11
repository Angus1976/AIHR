<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

type Role = 'JOB_SEEKER' | 'PARTNER' | 'ENTERPRISE_USER';

type UserInfo = {
  id: string;
  displayName: string;
  role: string;
  email?: string | null;
  phone?: string | null;
};

type Job = { id: string; title: string; enterprise: { name: string }; _count?: { applications: number } };
type Product = { id: string; name: string; amountFen: number; description: string | null; orderKind: string };
type Notice = { id: string; title: string; body: string; category: string; readAt: string | null; createdAt: string };
type Application = { id: string; status: string; pitch: string | null; jobPosting: { title: string; enterprise: { name: string } } };
type Contract = { id: string; title: string; status: string; signatureRef: string | null };
type Order = { id: string; description: string | null; status: string; amountFen: number };
type Refund = { id: string; status: string; amountFen: number; reason: string | null };
type PartnerApp = { id: string; orgName: string; category: string; status: string; reviewNote: string | null };
type InterviewOpportunity = {
  id: string;
  status: string;
  scheduledAt: string | null;
  note: string | null;
  jobPosting: { title: string; enterprise: { name: string } };
};
type ServiceStep = {
  id: string;
  key: string;
  title: string;
  status: string;
  providerType: string;
  valueProposition: string;
  deliverableSummary: string | null;
  partnerOrgName: string | null;
  interactions?: Array<{
    id: string;
    outputText: string;
    createdAt: string;
    vendor: string;
    feedbackRating?: number | null;
    feedbackText?: string | null;
  }>;
};
type ServiceMilestone = {
  id: string;
  title: string;
  status: string;
  amountFen: number;
  triggerText: string;
};
type ServicePlan = {
  id: string;
  targetRole: string | null;
  salaryMinFen: number | null;
  salaryMaxFen: number | null;
  summary: string | null;
  steps: ServiceStep[];
  milestones: ServiceMilestone[];
};

const roleOptions: Array<{ role: Role; label: string; hint: string; identity: { phone?: string; email?: string } }> = [
  { role: 'JOB_SEEKER', label: '求职者 · 陈一舟', hint: '浏览岗位、投递、档案、付费、合同、退款', identity: { phone: '13600000001' } },
  { role: 'PARTNER', label: '伙伴机构 · 南山职业训练营', hint: '提交入驻、查看审核与通知', identity: { email: 'partner.demo@aihr.local' } },
  { role: 'ENTERPRISE_USER', label: '企业联系人 · 森禾科技', hint: '体验企业侧移动入口占位与岗位可见性', identity: { email: 'enterprise.demo@aihr.local' } },
];

const role = ref<Role>('JOB_SEEKER');
const token = ref(localStorage.getItem('aihr_sim_token') || '');
const user = ref<UserInfo | null>(null);
const err = ref('');
const loading = ref(false);
const tab = ref<'home' | 'service' | 'mine'>('home');
type MineInner = 'profile' | 'interview' | 'billing' | 'notifications' | 'partner';
const mineInnerTab = ref<MineInner>('profile');

const homeScrollRef = ref<HTMLElement | null>(null);
const serviceScrollRef = ref<HTMLElement | null>(null);
const homeActiveStep = ref(0);
const serviceActiveStepIndex = ref(0);
let homeScrollRaf = 0;
let serviceScrollRaf = 0;

/** 侧栏进度条：默认展开，在侧栏上左滑收起 */
const homeRailOpen = ref(true);
const serviceRailOpen = ref(true);
let railSwipeStartX = 0;
let railSwipeStartY = 0;

function onRailSwipeStart(e: TouchEvent) {
  const t = e.touches[0];
  if (!t) return;
  railSwipeStartX = t.clientX;
  railSwipeStartY = t.clientY;
}

function onRailSwipeEnd(e: TouchEvent, target: 'home' | 'service') {
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - railSwipeStartX;
  const dy = t.clientY - railSwipeStartY;
  if (dx < -44 && Math.abs(dx) > Math.abs(dy) * 1.15) {
    if (target === 'home') homeRailOpen.value = false;
    else serviceRailOpen.value = false;
  }
}

function onHomeRailSwipeEnd(e: TouchEvent) {
  onRailSwipeEnd(e, 'home');
}

function onServiceRailSwipeEnd(e: TouchEvent) {
  onRailSwipeEnd(e, 'service');
}

const jobs = ref<Job[]>([]);
const products = ref<Product[]>([]);
const notices = ref<Notice[]>([]);
const applications = ref<Application[]>([]);
const contracts = ref<Contract[]>([]);
const orders = ref<Order[]>([]);
const refunds = ref<Refund[]>([]);
const partnerApps = ref<PartnerApp[]>([]);
const interviewOpportunities = ref<InterviewOpportunity[]>([]);
const servicePlan = ref<ServicePlan | null>(null);
const mockSessions = ref<Array<Record<string, unknown>>>([]);
const ensureForm = ref({ targetRole: '前端工程师', summary: '我确认进入 6 步就业服务路径。' });
const complementByStep = ref<Record<string, string>>({});
const profile = ref({ headline: '', skillsText: '', resumeMarkdown: '' });
const partnerForm = ref({
  orgName: '本地模拟伙伴机构',
  contactName: '模拟联系人',
  contactPhone: '13900009999',
  contactEmail: 'local-partner@example.com',
  category: '培训机构',
  qualification: '本地模拟资质说明',
  courseSummary: '本地模拟课程摘要',
});

const currentRole = computed(() => roleOptions.find((r) => r.role === role.value)!);
const authed = computed(() => Boolean(token.value));
const unread = computed(() => notices.value.filter((n) => !n.readAt).length);
const completedSteps = computed(() =>
  servicePlan.value?.steps.filter((s) => s.status === 'DELIVERED' || s.status === 'CONFIRMED').length ?? 0,
);

const mineNavItems = computed(() => {
  if (role.value === 'JOB_SEEKER') {
    return [
      { key: 'profile' as const, label: '档案' },
      { key: 'interview' as const, label: '面试' },
      { key: 'billing' as const, label: '订单' },
      { key: 'notifications' as const, label: '通知' },
    ];
  }
  if (role.value === 'PARTNER') {
    return [
      { key: 'partner' as const, label: '入驻' },
      { key: 'notifications' as const, label: '通知' },
    ];
  }
  return [{ key: 'notifications' as const, label: '通知' }];
});

const homeStepTotal = computed(() => 1 + jobs.value.length + products.value.length);

const serviceRailSteps = computed(() => servicePlan.value?.steps ?? []);

function stepIsDone(status: string) {
  return status === 'DELIVERED' || status === 'CONFIRMED';
}

function pickActiveScrollIndex(container: HTMLElement, selector: string) {
  const els = Array.from(container.querySelectorAll<HTMLElement>(selector));
  if (!els.length) return 0;
  const rootRect = container.getBoundingClientRect();
  const centerY = rootRect.top + rootRect.height / 2;
  let best = 0;
  let bestDist = Infinity;
  els.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    const d = Math.abs(mid - centerY);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

function onHomeScroll() {
  if (homeScrollRaf) cancelAnimationFrame(homeScrollRaf);
  homeScrollRaf = requestAnimationFrame(() => {
    homeScrollRaf = 0;
    const el = homeScrollRef.value;
    if (!el) return;
    const total = homeStepTotal.value;
    if (total <= 0) {
      homeActiveStep.value = 0;
      return;
    }
    homeActiveStep.value = Math.min(pickActiveScrollIndex(el, '[data-home-step]'), total - 1);
  });
}

function onServiceScroll() {
  if (serviceScrollRaf) cancelAnimationFrame(serviceScrollRaf);
  serviceScrollRaf = requestAnimationFrame(() => {
    serviceScrollRaf = 0;
    const el = serviceScrollRef.value;
    if (!el) return;
    const steps = el.querySelectorAll('[data-service-step]');
    if (!steps.length) {
      serviceActiveStepIndex.value = 0;
      return;
    }
    serviceActiveStepIndex.value = pickActiveScrollIndex(el, '[data-service-step]');
  });
}

function syncMineInnerToRole() {
  const items = mineNavItems.value.map((i) => i.key);
  if (!items.includes(mineInnerTab.value)) {
    mineInnerTab.value = items[0]!;
  }
}

watch(role, () => {
  syncMineInnerToRole();
  if (tab.value === 'service' && role.value !== 'JOB_SEEKER') {
    tab.value = 'home';
  }
});

watch(tab, async (t) => {
  await nextTick();
  if (t === 'home') onHomeScroll();
  if (t === 'service') onServiceScroll();
});

watch(homeStepTotal, async () => {
  await nextTick();
  if (tab.value === 'home') onHomeScroll();
});

watch(serviceRailSteps, async () => {
  await nextTick();
  if (tab.value === 'service') onServiceScroll();
});

const API_TIMEOUT_MS = 45_000;

function providerLabel(type: string) {
  return (
    {
      PLATFORM: '平台服务',
      PARTNER: '协作服务',
      AI_ASSISTED: '平台服务',
      HYBRID: '综合服务',
    }[type] || '平台服务'
  );
}

function neutralText(value: unknown) {
  return String(value ?? '')
    .replace(/AI\s*建议/g, '服务建议')
    .replace(/AI\/伙伴/g, '协作服务')
    .replace(/AI/g, '平台')
    .replace(/真人专家|专家/g, '服务团队')
    .replace(/就业老师|老师/g, '平台')
    .replace(/职业发展顾问|职业顾问|顾问/g, '服务团队')
    .replace(/机器人/g, '会中能力')
    .replace(/提示词/g, '服务配置')
    .replace(/模型路由|模型/g, '服务配置');
}

function transportLabel(value: unknown) {
  return (
    {
      TENCENT_MEETING: '腾讯会议',
      TRTC: '实时音视频',
      HYBRID: '会议 + 实时音视频',
    }[String(value ?? '')] || '在线面试'
  );
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const skipAuth = path === '/auth/dev/login' || path === '/auth/wechat/mini';
  if (token.value && !skipAuth) {
    headers.set('Authorization', `Bearer ${token.value}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`/v1${path}`, { ...init, headers, signal: controller.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string | string[] };
      throw new Error(
        Array.isArray(body.message) ? body.message.join('; ') : body.message || `HTTP ${res.status}`,
      );
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('请求超时，请检查网络或稍后重试');
    }
    if (e instanceof TypeError) {
      const m = e.message || '';
      if (/fetch|Failed to fetch|network|load/i.test(m)) {
        throw new Error('无法连接 API，请确认 API 已启动且 Vite 代理目标正确（默认同区 http://localhost:3300）');
      }
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function devLogin() {
  err.value = '';
  loading.value = true;
  try {
    const data = await api<{ accessToken: string; user: UserInfo }>('/auth/dev/login', {
      method: 'POST',
      body: JSON.stringify({ role: role.value, ...currentRole.value.identity }),
    });
    token.value = data.accessToken;
    user.value = data.user;
    localStorage.setItem('aihr_sim_token', data.accessToken);
    await loadAll();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '登录失败';
  } finally {
    loading.value = false;
  }
}

function logout() {
  token.value = '';
  user.value = null;
  localStorage.removeItem('aihr_sim_token');
}

async function loadAll() {
  if (!token.value) return;
  err.value = '';
  loading.value = true;
  try {
    const baseTasks = [
      api<Job[]>('/jobs/published').then((v) => (jobs.value = v)),
      api<Product[]>('/service-products?audience=JOB_SEEKER').then((v) => (products.value = v)),
      api<Notice[]>('/notifications/me').then((v) => (notices.value = v)),
    ];
    const seekerTasks = role.value === 'JOB_SEEKER'
      ? [
          api<Application[]>('/me/applications').then((v) => (applications.value = v)),
          api<InterviewOpportunity[]>('/interview-opportunities/me').then((v) => (interviewOpportunities.value = v)),
          api<Contract[]>('/contracts/me').then((v) => (contracts.value = v)),
          api<Order[]>('/orders/me').then((v) => (orders.value = v)),
          api<Refund[]>('/orders/refund-requests/me').then((v) => (refunds.value = v)),
          api<ServicePlan | null>('/service-plans/me').then((v) => (servicePlan.value = v)),
          api<Record<string, unknown>[]>('/me/mock-interview/sessions')
            .then((v) => {
              mockSessions.value = Array.isArray(v) ? v : [];
            })
            .catch(() => {
              mockSessions.value = [];
            }),
          api<typeof profile.value | null>('/me/profile').then((v) => {
            profile.value = {
              headline: v?.headline ?? '',
              skillsText: v?.skillsText ?? '',
              resumeMarkdown: v?.resumeMarkdown ?? '',
            };
          }),
        ]
      : [];
    const partnerTasks = role.value === 'PARTNER'
      ? [api<PartnerApp[]>('/partner-applications/me').then((v) => (partnerApps.value = v))]
      : [];
    await Promise.all([...baseTasks, ...seekerTasks, ...partnerTasks]);
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  await api('/me/profile', {
    method: 'PUT',
    body: JSON.stringify(profile.value),
  });
  await loadAll();
}

async function apply(job: Job) {
  await api(`/jobs/${job.id}/applications`, {
    method: 'POST',
    body: JSON.stringify({ pitch: '本地模拟：我对该岗位感兴趣，已提交投递。' }),
  });
  await loadAll();
}

async function respondInterview(item: InterviewOpportunity, status: 'ACCEPTED' | 'DECLINED') {
  await api(`/interview-opportunities/${item.id}/respond`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note: status === 'ACCEPTED' ? '本地模拟：确认参加面试' : '本地模拟：暂不参加面试' }),
  });
  await loadAll();
}

function setComplement(stepId: string, value: string) {
  complementByStep.value = { ...complementByStep.value, [stepId]: value };
}

async function ensureMyPlan() {
  await api('/service-plans/me/ensure', {
    method: 'POST',
    body: JSON.stringify({
      targetRole: ensureForm.value.targetRole.trim() || undefined,
      summary: ensureForm.value.summary.trim() || undefined,
    }),
  });
  await loadAll();
}

async function bookMockInterview() {
  if (!servicePlan.value) return;
  await api('/me/mock-interview/sessions', {
    method: 'POST',
    body: JSON.stringify({ servicePlanId: servicePlan.value.id }),
  });
  await loadAll();
}

function goSeekerProfileTab() {
  tab.value = 'mine';
  mineInnerTab.value = 'profile';
}
function goSeekerInterviewTab() {
  tab.value = 'mine';
  mineInnerTab.value = 'interview';
}

async function requestStep(step: ServiceStep) {
  if (!servicePlan.value) return;
  const extra = complementByStep.value[step.id]?.trim();
  const inputText = extra
    ? `${extra}\n\n请结合平台已采集的投递、面试与档案信息，输出本环节可执行建议。`
    : '请基于我的档案与平台已采集的信息生成本环节服务建议。';
  await api(`/service-plans/${servicePlan.value.id}/steps/${step.id}/request`, {
    method: 'POST',
    body: JSON.stringify({ inputText }),
  });
  await loadAll();
}

async function confirmStep(step: ServiceStep) {
  if (!servicePlan.value) return;
  await api(`/service-plans/${servicePlan.value.id}/steps/${step.id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  await loadAll();
}

async function feedbackStep(step: ServiceStep, rating: number) {
  if (!servicePlan.value || !step.interactions?.[0]) return;
  await api(`/service-plans/${servicePlan.value.id}/steps/${step.id}/interactions/${step.interactions[0].id}/feedback`, {
    method: 'PATCH',
    body: JSON.stringify({
      rating,
      feedbackText: rating >= 4 ? '该建议有帮助' : '该建议需要进一步改进',
    }),
  });
  await loadAll();
}

async function sign(contract: Contract) {
  await api(`/contracts/${contract.id}/sign-stub`, { method: 'POST', body: JSON.stringify({}) });
  await loadAll();
}

async function refund(order: Order) {
  await api(`/orders/${order.id}/refund-requests`, {
    method: 'POST',
    body: JSON.stringify({ amountFen: Math.max(1, Math.floor(order.amountFen / 10)), reason: '本地模拟退款申请' }),
  });
  await loadAll();
}

async function pay(product: Product) {
  await api('/consents', {
    method: 'POST',
    body: JSON.stringify({
      purpose: 'SERVICE_PAYMENT',
      version: 'local-sim',
      content: '本地模拟：我同意服务说明、个人信息处理规则与支付条款。',
      metadata: { productId: product.id },
    }),
  });
  await api('/payments/wechat/jsapi', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      amountFen: product.amountFen,
      kind: product.orderKind,
      description: product.name,
    }),
  });
  await loadAll();
}

async function payMilestone(milestone: ServiceMilestone) {
  await api('/consents', {
    method: 'POST',
    body: JSON.stringify({
      purpose: 'SERVICE_PAYMENT_MILESTONE',
      version: 'local-sim',
      content: '本地模拟：我同意按服务进度支付该节点费用。',
      metadata: { milestoneId: milestone.id, title: milestone.title },
    }),
  });
  await api('/payments/wechat/jsapi', {
    method: 'POST',
    body: JSON.stringify({
      milestoneId: milestone.id,
      amountFen: milestone.amountFen,
      kind: 'SEEKER_SERVICE_FEE',
      description: milestone.title,
    }),
  });
  await loadAll();
}

async function submitPartner() {
  await api('/partner-applications', {
    method: 'POST',
    body: JSON.stringify(partnerForm.value),
  });
  await loadAll();
}

onMounted(() => {
  syncMineInnerToRole();
  if (token.value) loadAll();
});
</script>

<template>
  <main class="sim-page">
    <section class="control">
      <div>
        <div class="eyebrow">Local WeChat Mini Program Simulator</div>
        <h1>职得（Jobde）小程序本地模拟器</h1>
        <p>不依赖真实微信开发者工具，直接用本地 API 模拟不同角色的移动端路径。</p>
      </div>
      <div class="role-card">
        <label>选择角色</label>
        <select v-model="role">
          <option v-for="r in roleOptions" :key="r.role" :value="r.role">{{ r.label }}</option>
        </select>
        <p>{{ currentRole.hint }}</p>
        <button class="primary" :disabled="loading" @click="devLogin">{{ authed ? '切换并重新登录' : '本地模拟登录' }}</button>
        <button v-if="authed" class="ghost" @click="logout">退出</button>
      </div>
    </section>

    <section class="phone-wrap">
      <div class="phone">
        <div class="status">9:41 <span>{{ user?.displayName || '未登录' }}</span></div>
        <header>
          <div class="header-brand">
            <img src="/brand-logo.png" alt="" class="header-logo" width="120" height="40" />
          </div>
          <em v-if="unread">{{ unread }}</em>
        </header>
        <div v-if="err" class="error">{{ err }}</div>
        <div v-if="!authed" class="empty">
          <strong>请选择角色并登录</strong>
          <p>建议先运行 <code>npm run prisma:demo</code>，确保每个角色都有完整模拟数据。</p>
        </div>
        <template v-else>
          <nav>
            <button :class="{ active: tab === 'home' }" @click="tab = 'home'">首页</button>
            <button v-if="role === 'JOB_SEEKER'" :class="{ active: tab === 'service' }" @click="tab = 'service'">服务</button>
            <button :class="{ active: tab === 'mine' }" @click="tab = 'mine'">我的</button>
          </nav>

          <section v-if="tab === 'home'" class="content content-with-rail" :class="{ 'rail-collapsed': !homeRailOpen }">
            <aside
              v-if="homeRailOpen"
              class="scroll-rail scroll-rail--narrow"
              aria-hidden="true"
              @touchstart.passive="onRailSwipeStart"
              @touchend.passive="onHomeRailSwipeEnd"
            >
              <div class="rail-track rail-track--narrow">
                <template v-for="(_, i) in homeStepTotal" :key="i">
                  <div
                    class="rail-dot rail-dot--narrow"
                    :class="{
                      done: i < homeActiveStep,
                      active: i === homeActiveStep,
                      todo: i > homeActiveStep,
                    }"
                  />
                </template>
              </div>
              <p class="rail-caption rail-caption--tight">{{ homeActiveStep + 1 }}/{{ homeStepTotal }}</p>
              <p class="rail-hint rail-hint--tight">左滑收起 · 高亮为当前</p>
            </aside>
            <button
              v-else
              type="button"
              class="rail-peek"
              aria-label="展开进度"
              @click="homeRailOpen = true"
            >
              ›
            </button>
            <div ref="homeScrollRef" class="content-scroll" @scroll.passive="onHomeScroll">
              <div class="hero" data-home-step>
                <span>Jobde</span>
                <h2>从岗位匹配到服务履约</h2>
                <p>本地模拟环境已连接 API，可完整试用移动端路径。</p>
              </div>
              <article v-for="job in jobs" :key="job.id" class="card" data-home-step>
                <strong>{{ job.title }}</strong>
                <p>{{ job.enterprise?.name }} · 投递 {{ job._count?.applications ?? 0 }}</p>
                <button v-if="role === 'JOB_SEEKER'" @click="apply(job)">投递该岗位</button>
              </article>
              <article v-for="p in products" :key="p.id" class="card product" data-home-step>
                <strong>{{ p.name }}</strong>
                <p>{{ p.description || '服务产品' }}</p>
                <button v-if="role === 'JOB_SEEKER'" @click="pay(p)">同意并预下单 ¥{{ (p.amountFen / 100).toFixed(2) }}</button>
              </article>
            </div>
          </section>

          <section v-if="tab === 'service'" class="content content-with-rail" :class="{ 'rail-collapsed': !serviceRailOpen }">
            <aside
              v-if="serviceRailOpen && serviceRailSteps.length"
              class="scroll-rail scroll-rail--narrow service-rail"
              aria-hidden="true"
              @touchstart.passive="onRailSwipeStart"
              @touchend.passive="onServiceRailSwipeEnd"
            >
              <div class="rail-track rail-track--service rail-track--narrow">
                <div
                  v-for="(s, i) in serviceRailSteps"
                  :key="s.id"
                  class="rail-dot rail-dot--narrow"
                  :class="{
                    done: stepIsDone(s.status),
                    todo: !stepIsDone(s.status),
                    active: i === serviceActiveStepIndex,
                  }"
                />
              </div>
              <p class="rail-caption rail-caption--tight">
                {{ serviceActiveStepIndex + 1 }}/{{ serviceRailSteps.length }}
                <template v-if="serviceRailSteps[serviceActiveStepIndex]">
                  {{ stepIsDone(serviceRailSteps[serviceActiveStepIndex]!.status) ? ' 已完' : ' 待办' }}
                </template>
              </p>
              <p class="rail-hint rail-hint--tight">左滑收起 · 青点已交付</p>
            </aside>
            <div
              v-else-if="serviceRailOpen && !serviceRailSteps.length"
              class="scroll-rail scroll-rail--placeholder scroll-rail--narrow"
              aria-hidden="true"
              @touchstart.passive="onRailSwipeStart"
              @touchend.passive="onServiceRailSwipeEnd"
            >
              <p class="rail-caption rail-caption--tight">无计划</p>
              <p class="rail-hint rail-hint--tight">左滑收起</p>
            </div>
            <button
              v-else
              type="button"
              class="rail-peek"
              aria-label="展开进度"
              @click="serviceRailOpen = true"
            >
              ›
            </button>
            <div ref="serviceScrollRef" class="content-scroll" @scroll.passive="onServiceScroll">
              <div class="hero" data-service-ancillary>
                <span>Jobde · 6-Step</span>
                <h2>6 步就业服务路径</h2>
                <p>{{ neutralText(servicePlan?.summary || '暂无专属服务计划时，可先在下方生成，或由平台服务团队创建。') }}</p>
                <p v-if="servicePlan">{{ completedSteps }}/6 已交付或确认 · 目标 {{ servicePlan.targetRole || '待确认' }}</p>
              </div>
              <article v-if="!servicePlan" class="card ensure" data-service-ancillary>
                <strong>首次使用：生成服务计划</strong>
                <label>目标岗位<input v-model="ensureForm.targetRole" /></label>
                <label>备注<textarea v-model="ensureForm.summary" rows="2" /></label>
                <button class="wide" @click="ensureMyPlan">生成我的 6 步服务计划</button>
              </article>
              <article
                v-for="(step, idx) in servicePlan?.steps || []"
                :key="step.id"
                class="card service-step"
                data-service-step
              >
              <small>{{ String(idx + 1).padStart(2, '0') }} · {{ providerLabel(step.providerType) }}</small>
              <strong>{{ step.title }}</strong>
              <p>{{ neutralText(step.valueProposition) }}</p>
              <p>{{ step.status }} · {{ step.partnerOrgName || providerLabel(step.providerType) }}</p>
              <div v-if="step.key === 'PRE_CAREER_PLANNING'" class="flow-panel">
                <p><strong>求职流程 · 建档与方向</strong> — 建议先完善档案再获取本环节服务建议。</p>
                <button type="button" @click="goSeekerProfileTab">去完善档案</button>
              </div>
              <div v-if="step.key === 'RESUME_OPTIMIZATION'" class="flow-panel">
                <p><strong>求职流程 · 简历材料</strong> — 对照目标岗位完成诊断与改稿提示。</p>
              </div>
              <div v-if="step.key === 'INTERVIEW_COACHING'" class="flow-panel">
                <p>
                  <strong>腾讯会议 · 模拟面试</strong> — 通信走腾讯会议；会中引导、记录与复盘说明通过会议侧能力承载（未开接口时为占位链接）。
                </p>
                <p v-if="mockSessions[0]" class="deliverable">
                  会议：{{ mockSessions[0].meetingId || '待生成' }} ·
                  {{ transportLabel(mockSessions[0].transport) }} ·
                  {{ String(mockSessions[0].vrSceneName || (mockSessions[0].sceneMode === 'VR' ? '沉浸式面试场景' : '标准面试场景')) }}
                </p>
                <p v-if="mockSessions[0]" class="deliverable">
                  独立作答：{{
                    Array.isArray(mockSessions[0].antiAssistRules)
                      ? mockSessions[0].antiAssistRules.slice(0, 3).join(' / ')
                      : '请保持摄像头开启并独立作答；作答区不展示实时答案提示。'
                  }}
                </p>
                <p v-if="mockSessions[0]?.trtcRoomId" class="deliverable">
                  实时房间：{{ mockSessions[0].trtcRoomId }}
                </p>
                <button type="button" :disabled="loading" @click="bookMockInterview">预约一场模拟面试</button>
              </div>
              <div v-if="step.key === 'INTERVIEW_CONFIRMATION'" class="flow-panel">
                <p><strong>求职流程 · 企业面试机会</strong> — 在「面试」页确认参加或拒绝平台推送的机会。</p>
                <button type="button" @click="goSeekerInterviewTab">前往「我的 · 面试」</button>
              </div>
              <label v-if="step.status !== 'LOCKED'" class="complement"
                >本环节补充（可选）
                <textarea
                  :value="complementByStep[step.id] ?? ''"
                  rows="2"
                  placeholder="本环节想补充的说明"
                  @input="setComplement(step.id, ($event.target as HTMLTextAreaElement).value)"
                />
              </label>
              <p v-if="step.deliverableSummary" class="deliverable">{{ neutralText(step.deliverableSummary) }}</p>
              <p v-if="step.interactions?.[0]" class="deliverable">{{ neutralText(step.interactions[0].outputText) }}</p>
              <div v-if="step.interactions?.[0]" class="feedback-actions">
                <button @click="feedbackStep(step, 5)">有帮助</button>
                <button class="secondary" @click="feedbackStep(step, 2)">需改进</button>
                <span v-if="step.interactions[0].feedbackRating">已反馈 {{ step.interactions[0].feedbackRating }} 分</span>
              </div>
              <button v-if="step.status !== 'LOCKED'" @click="requestStep(step)">获取该环节服务建议</button>
              <button v-if="step.status === 'DELIVERED'" class="secondary" @click="confirmStep(step)">确认该环节成果</button>
            </article>
              <article v-for="m in servicePlan?.milestones || []" :key="m.id" class="card milestone" data-service-ancillary>
                <strong>{{ m.title }}</strong>
                <p>{{ m.triggerText }}</p>
                <p>{{ m.amountFen ? '¥' + (m.amountFen / 100).toFixed(2) : '无需付款' }} · {{ m.status }}</p>
                <button v-if="m.status === 'PAYABLE' && m.amountFen > 0" @click="payMilestone(m)">支付该节点</button>
              </article>
            </div>
          </section>

          <section v-if="tab === 'mine'" class="content">
            <div class="mine-subnav" role="tablist">
              <button
                v-for="item in mineNavItems"
                :key="item.key"
                type="button"
                role="tab"
                :class="{ active: mineInnerTab === item.key }"
                @click="mineInnerTab = item.key"
              >
                {{ item.label }}
              </button>
            </div>

            <template v-if="mineInnerTab === 'profile' && role === 'JOB_SEEKER'">
              <label>一句话亮点<input v-model="profile.headline" /></label>
              <label>技能关键词<textarea v-model="profile.skillsText" rows="4" /></label>
              <label>简历摘要<textarea v-model="profile.resumeMarkdown" rows="5" /></label>
              <button class="wide" @click="saveProfile">保存档案</button>
              <article v-for="a in applications" :key="a.id" class="card">
                <strong>{{ a.jobPosting?.title }}</strong>
                <p>{{ a.jobPosting?.enterprise?.name }} · {{ a.status }}</p>
              </article>
              <article v-for="c in contracts" :key="c.id" class="card">
                <strong>{{ c.title }}</strong>
                <p>{{ c.status }} · {{ c.signatureRef || '未签署' }}</p>
                <button v-if="c.status !== 'SIGNED'" @click="sign(c)">签署占位</button>
              </article>
            </template>

            <template v-else-if="mineInnerTab === 'interview' && role === 'JOB_SEEKER'">
              <div class="hero">
                <span>Interview Confirmation</span>
                <h2>面试机会确认</h2>
                <p>平台推送企业岗位面试机会后，你可以明确选择参加或拒绝。</p>
              </div>
              <article v-for="item in interviewOpportunities" :key="item.id" class="card">
                <strong>{{ item.jobPosting.title }}</strong>
                <p>{{ item.jobPosting.enterprise.name }} · {{ item.status }}</p>
                <p v-if="item.scheduledAt">建议时间：{{ item.scheduledAt }}</p>
                <p v-if="item.note">{{ item.note }}</p>
                <button v-if="item.status === 'PENDING'" @click="respondInterview(item, 'ACCEPTED')">确认参加</button>
                <button v-if="item.status === 'PENDING'" class="secondary" @click="respondInterview(item, 'DECLINED')">拒绝参加</button>
              </article>
              <div v-if="!interviewOpportunities.length" class="empty">
                <strong>暂无面试机会</strong>
                <p>等待平台推送岗位面试机会。</p>
              </div>
            </template>

            <template v-else-if="mineInnerTab === 'billing' && role === 'JOB_SEEKER'">
              <article v-for="o in orders" :key="o.id" class="card">
                <strong>{{ o.description || '订单' }}</strong>
                <p>{{ o.status }} · ¥{{ (o.amountFen / 100).toFixed(2) }}</p>
                <button @click="refund(o)">申请部分退款</button>
              </article>
              <article v-for="r in refunds" :key="r.id" class="card">
                <strong>退款申请</strong>
                <p>{{ r.status }} · {{ r.amountFen }} 分</p>
              </article>
            </template>

            <template v-else-if="mineInnerTab === 'partner' && role === 'PARTNER'">
              <label>机构名称<input v-model="partnerForm.orgName" /></label>
              <label>联系人<input v-model="partnerForm.contactName" /></label>
              <label>类型<input v-model="partnerForm.category" /></label>
              <label>资质<textarea v-model="partnerForm.qualification" rows="4" /></label>
              <button class="wide" @click="submitPartner">提交入驻申请</button>
              <article v-for="p in partnerApps" :key="p.id" class="card">
                <strong>{{ p.orgName }}</strong>
                <p>{{ p.category }} · {{ p.status }}</p>
                <p>{{ p.reviewNote || '等待审核' }}</p>
              </article>
            </template>

            <template v-else-if="mineInnerTab === 'notifications'">
              <article v-for="n in notices" :key="n.id" class="card notice" :class="{ unread: !n.readAt }">
                <strong>{{ n.title }}</strong>
                <p>{{ n.body }}</p>
                <span>{{ n.category }}</span>
              </article>
            </template>
          </section>
        </template>
      </div>
    </section>
  </main>
</template>
