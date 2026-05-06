<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type Step = {
  id: string;
  title: string;
  status: string;
  providerType: string;
  valueProposition: string;
  deliverableSummary: string | null;
  partnerOrgName: string | null;
  interactions?: Array<{
    id: string;
    outputText: string;
    inputText: string | null;
    vendor: string;
    modelName: string | null;
    createdAt: string;
    feedbackRating?: number | null;
    feedbackText?: string | null;
    feedbackAt?: string | null;
  }>;
};
type Milestone = {
  id: string;
  title: string;
  amountFen: number;
  status: string;
  triggerText: string;
};
type MockSession = {
  id: string;
  status: string;
  transport: string;
  sceneMode: string;
  subject: string | null;
  meetingId: string | null;
  joinUrl: string | null;
  interviewerRole: string | null;
  interviewerRequirements: string | null;
  trtcRoomId: string | null;
  vrSceneName: string | null;
  antiAssistRules?: string[] | null;
  createdAt: string;
};
type Plan = {
  id: string;
  seekerUserId: string;
  targetRole: string | null;
  salaryMinFen: number | null;
  salaryMaxFen: number | null;
  summary: string | null;
  seeker: { displayName: string; phone: string | null; email: string | null };
  steps: Step[];
  milestones: Milestone[];
};

const plans = ref<Plan[]>([]);
const selected = ref<Plan | null>(null);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const mockSessions = ref<MockSession[]>([]);
const form = ref({
  userId: '',
  targetRole: '前端工程师 · 小程序与运营后台',
  salaryMinFen: 1800000,
  salaryMaxFen: 2500000,
  summary: '求职者确认进入 6 步就业服务路径。',
});
const mockForm = ref({
  transport: 'HYBRID',
  sceneMode: 'VR',
  interviewerRole: '业务面试官',
  interviewerRequirements:
    '围绕岗位匹配、项目经历、表达结构与稳定性进行追问，控制节奏并保留复盘要点。',
  evaluationFocus: '岗位理解\n项目复盘\n表达结构\n临场沟通',
  antiAssistRules: '保持摄像头开启并独立作答\n不在作答区展示实时答案或外部提示\n回答以个人经历和现场思考为准',
  vrSceneKey: 'interview-room-classic',
  vrSceneName: '沉浸式面试间',
});
const stepStatuses = ['LOCKED', 'NOT_STARTED', 'IN_PROGRESS', 'DELIVERED', 'CONFIRMED'];
const milestoneStatuses = ['LOCKED', 'PAYABLE', 'PAID', 'WAIVED', 'REFUNDED'];

function lines(value: string) {
  return value
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

async function load() {
  err.value = '';
  loading.value = true;
  try {
    plans.value = await api<Plan[]>('/service-plans');
    if (selected.value) {
      selected.value = plans.value.find((p) => p.id === selected.value?.id) ?? null;
      await loadMockSessions();
    }
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function ensure() {
  err.value = '';
  msg.value = '';
  if (!form.value.userId.trim()) {
    err.value = '请填写求职者用户 ID';
    return;
  }
  loading.value = true;
  try {
    const plan = await api<Plan>(`/service-plans/users/${form.value.userId.trim()}/ensure`, {
      method: 'POST',
      body: JSON.stringify({
        targetRole: form.value.targetRole.trim() || undefined,
        salaryMinFen: Number(form.value.salaryMinFen) || undefined,
        salaryMaxFen: Number(form.value.salaryMaxFen) || undefined,
        summary: form.value.summary.trim() || undefined,
      }),
    });
    selected.value = plan;
    msg.value = '服务计划已生成/更新';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '创建失败';
  } finally {
    loading.value = false;
  }
}

async function selectPlan(p: Plan) {
  selected.value = p;
  await loadMockSessions();
}

async function loadMockSessions() {
  mockSessions.value = [];
  if (!selected.value) return;
  try {
    mockSessions.value = await api<MockSession[]>(
      `/mock-interviews/users/${selected.value.seekerUserId}/sessions`,
    );
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载模拟面试失败';
  }
}

async function createMockInterview() {
  if (!selected.value) return;
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/mock-interviews/users/${selected.value.seekerUserId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({
        servicePlanId: selected.value.id,
        transport: mockForm.value.transport,
        sceneMode: mockForm.value.sceneMode,
        interviewerRole: mockForm.value.interviewerRole.trim() || undefined,
        interviewerRequirements:
          mockForm.value.interviewerRequirements.trim() || undefined,
        evaluationFocus: lines(mockForm.value.evaluationFocus),
        antiAssistRules: lines(mockForm.value.antiAssistRules),
        vrSceneKey: mockForm.value.vrSceneKey.trim() || undefined,
        vrSceneName: mockForm.value.vrSceneName.trim() || undefined,
      }),
    });
    msg.value = '模拟面试会话已创建';
    await loadMockSessions();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '创建模拟面试失败';
  } finally {
    loading.value = false;
  }
}

async function updateStep(step: Step, status: string) {
  if (!selected.value) return;
  await api(`/service-plans/${selected.value.id}/steps/${step.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  await load();
}

async function requestStep(step: Step) {
  if (!selected.value) return;
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/service-plans/${selected.value.id}/steps/${step.id}/request`, {
      method: 'POST',
      body: JSON.stringify({
        inputText: `就业老师代求职者请求「${step.title}」服务建议。`,
      }),
    });
    msg.value = `已生成「${step.title}」服务建议`;
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '生成失败';
  } finally {
    loading.value = false;
  }
}

async function confirmStep(step: Step) {
  if (!selected.value) return;
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/service-plans/${selected.value.id}/steps/${step.id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    msg.value = `已确认「${step.title}」并推进下一环节`;
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '确认失败';
  } finally {
    loading.value = false;
  }
}

async function updateMilestone(m: Milestone, status: string) {
  if (!selected.value) return;
  await api(`/service-plans/${selected.value.id}/milestones/${m.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  await load();
}

function yuan(fen: number | null) {
  if (!fen) return '—';
  return `¥${(fen / 100).toFixed(2)}`;
}

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="page">
    <div class="head">
      <div>
        <h1>服务计划</h1>
        <p class="muted">围绕 6 步就业服务管理求职者进度，并维护签约与按进度付款节点。</p>
      </div>
      <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
    </div>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>

    <section class="card ensure">
      <h2>生成 / 更新求职者服务计划</h2>
      <div class="grid">
        <label>求职者用户 ID <input v-model="form.userId" /></label>
        <label>目标岗位 <input v-model="form.targetRole" /></label>
        <label>薪资下限（分） <input v-model.number="form.salaryMinFen" type="number" /></label>
        <label>薪资上限（分） <input v-model.number="form.salaryMaxFen" type="number" /></label>
      </div>
      <label>计划摘要 <textarea v-model="form.summary" rows="3" /></label>
      <button class="btn primary" type="button" :disabled="loading" @click="ensure">生成服务计划</button>
    </section>

    <section class="layout-grid">
      <aside class="card list">
        <h2>计划列表</h2>
        <button
          v-for="p in plans"
          :key="p.id"
          type="button"
          class="plan-row"
          :class="{ active: selected?.id === p.id }"
          @click="selectPlan(p)"
        >
          <strong>{{ p.seeker.displayName }}</strong>
          <span>{{ p.targetRole || '未确认方向' }}</span>
        </button>
      </aside>

      <section class="card detail">
        <template v-if="selected">
          <div class="detail-head">
            <div>
              <h2>{{ selected.seeker.displayName }} 的 6 步服务</h2>
              <p class="muted">
                {{ selected.targetRole || '未确认方向' }} · {{ yuan(selected.salaryMinFen) }} - {{ yuan(selected.salaryMaxFen) }}
              </p>
            </div>
            <span class="badge">{{ selected.steps.filter((s) => ['DELIVERED', 'CONFIRMED'].includes(s.status)).length }}/6</span>
          </div>

          <div class="steps">
            <article v-for="(s, idx) in selected.steps" :key="s.id" class="step-card">
              <small>{{ String(idx + 1).padStart(2, '0') }} · {{ s.providerType }}</small>
              <strong>{{ s.title }}</strong>
              <p>{{ s.valueProposition }}</p>
              <p v-if="s.deliverableSummary" class="deliverable">{{ s.deliverableSummary }}</p>
              <div v-if="s.interactions?.length" class="interaction-list">
                <div v-for="it in s.interactions" :key="it.id" class="interaction">
                  <small>
                    {{ new Date(it.createdAt).toLocaleString() }} · {{ it.vendor }}
                    {{ it.modelName || '' }}
                    <template v-if="it.feedbackRating != null"> · 反馈 {{ it.feedbackRating }} 分</template>
                  </small>
                  <p v-if="it.inputText" class="interaction-in">求职者/老师输入：{{ it.inputText }}</p>
                  <p>{{ it.outputText }}</p>
                  <p v-if="it.feedbackText" class="interaction-fb">反馈原文：{{ it.feedbackText }}</p>
                </div>
              </div>
              <select :value="s.status" @change="updateStep(s, ($event.target as HTMLSelectElement).value)">
                <option v-for="st in stepStatuses" :key="st" :value="st">{{ st }}</option>
              </select>
              <button
                v-if="s.status !== 'LOCKED'"
                type="button"
                class="btn step-request"
                :disabled="loading"
                @click="requestStep(s)"
              >
                代生成服务建议
              </button>
              <button
                v-if="s.status === 'DELIVERED'"
                type="button"
                class="btn step-confirm"
                :disabled="loading"
                @click="confirmStep(s)"
              >
                确认交付并解锁下一步
              </button>
            </article>
          </div>

          <h3>付款节点</h3>
          <div class="milestones">
            <article v-for="m in selected.milestones" :key="m.id" class="milestone">
              <div>
                <strong>{{ m.title }}</strong>
                <p>{{ m.triggerText }}</p>
              </div>
              <div>
                <b>{{ yuan(m.amountFen) }}</b>
                <select :value="m.status" @change="updateMilestone(m, ($event.target as HTMLSelectElement).value)">
                  <option v-for="st in milestoneStatuses" :key="st" :value="st">{{ st }}</option>
                </select>
              </div>
            </article>
          </div>

          <h3>模拟面试配置</h3>
          <section class="mock-config">
            <div class="grid">
              <label>
                通信方式
                <select v-model="mockForm.transport">
                  <option value="TENCENT_MEETING">腾讯会议</option>
                  <option value="TRTC">TRTC</option>
                  <option value="HYBRID">腾讯会议 + TRTC</option>
                </select>
              </label>
              <label>
                场景模式
                <select v-model="mockForm.sceneMode">
                  <option value="STANDARD">标准视频面试</option>
                  <option value="VR">VR 场景面试</option>
                </select>
              </label>
              <label>面试角色 <input v-model="mockForm.interviewerRole" maxlength="120" /></label>
              <label>VR 场景标识 <input v-model="mockForm.vrSceneKey" maxlength="80" /></label>
              <label>VR 场景名称 <input v-model="mockForm.vrSceneName" maxlength="120" /></label>
            </div>
            <label>
              面试要求与追问风格
              <textarea v-model="mockForm.interviewerRequirements" rows="3" maxlength="2000" />
            </label>
            <div class="grid two">
              <label>
                评估重点（一行一项）
                <textarea v-model="mockForm.evaluationFocus" rows="4" />
              </label>
              <label>
                防代答规则（一行一项）
                <textarea v-model="mockForm.antiAssistRules" rows="4" />
              </label>
            </div>
            <button type="button" class="btn primary" :disabled="loading" @click="createMockInterview">
              创建模拟面试会话
            </button>
            <p class="muted">
              候选人端只展示平台安排、场景说明与独立作答规则，不展示技术来源或实时答案提示。
            </p>
          </section>

          <div v-if="mockSessions.length" class="mock-list">
            <article v-for="s in mockSessions" :key="s.id" class="mock-row">
              <strong>{{ s.subject || '模拟面试' }}</strong>
              <p>
                {{ s.status }} · {{ s.transport }} · {{ s.sceneMode }}
                <template v-if="s.vrSceneName"> · {{ s.vrSceneName }}</template>
              </p>
              <p v-if="s.interviewerRole">角色：{{ s.interviewerRole }}</p>
              <p v-if="s.meetingId">会议：{{ s.meetingId }}</p>
              <p v-if="s.trtcRoomId">TRTC 房间：{{ s.trtcRoomId }}</p>
            </article>
          </div>
        </template>
        <p v-else class="muted">请选择一份服务计划。</p>
      </section>
    </section>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.page h1, h2, h3 { margin: 0; }
.muted { color: var(--color-muted); font-size: 14px; line-height: 1.7; }
.ok { color: var(--color-success); }
.bad { color: var(--color-warning); }
.ensure { margin: 1rem 0; padding: 1.25rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; margin: 1rem 0; }
label { display: flex; flex-direction: column; gap: 0.35rem; color: var(--color-muted); font-size: 13px; }
input, textarea, select { font: inherit; padding: 0.5rem 0.6rem; border: 1px solid var(--color-line); border-radius: 10px; }
.btn { border: none; border-radius: 10px; padding: 0.5rem 0.9rem; cursor: pointer; }
.btn.primary { background: var(--color-primary); color: oklch(0.98 0.008 80); }
.btn.ghost { background: var(--color-card); border: 1px solid var(--color-line); color: var(--color-primary-strong); }
.layout-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 1rem; }
.list, .detail { padding: 1.25rem; }
.plan-row { width: 100%; text-align: left; margin-top: 0.75rem; padding: 0.8rem; border-radius: 14px; border: 1px solid var(--color-line); background: rgba(255,253,248,0.72); color: var(--color-text); }
.plan-row.active { border-color: var(--color-accent); background: var(--color-accent-soft); }
.plan-row span { display: block; margin-top: 0.25rem; color: var(--color-muted); font-size: 13px; }
.detail-head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
.badge { padding: 0.35rem 0.7rem; border-radius: 999px; background: var(--color-success-bg); color: var(--color-success); font-weight: 800; }
.steps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; }
.step-card, .milestone { border: 1px solid var(--color-line); border-radius: 16px; padding: 1rem; background: rgba(255,253,248,0.72); }
.step-card small { color: var(--color-accent); font-weight: 800; letter-spacing: 0.08em; }
.step-card strong { display: block; margin-top: 0.5rem; color: var(--color-primary-strong); }
.step-card p, .milestone p { color: var(--color-muted); line-height: 1.6; }
.deliverable { padding: 0.65rem; border-radius: 12px; background: var(--color-accent-soft); color: var(--color-primary-strong) !important; }
.interaction-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 360px; overflow: auto; padding-right: 4px; }
.interaction { margin: 0; padding: 0.75rem; border-radius: 12px; background: rgba(147, 182, 155, 0.18); }
.interaction small { display: block; color: var(--color-success); font-weight: 800; letter-spacing: 0.04em; }
.interaction p { margin: 0.45rem 0 0; color: var(--color-primary-strong); }
.interaction-in, .interaction-fb { font-size: 13px; color: var(--color-muted) !important; }
.step-request { width: 100%; margin-top: 0.65rem; background: var(--color-card); border: 1px solid var(--color-line); color: var(--color-primary-strong); }
.step-confirm { width: 100%; margin-top: 0.5rem; background: var(--color-success-bg); border: 1px solid var(--color-line); color: var(--color-success); }
.milestones { display: grid; gap: 0.75rem; margin-top: 0.75rem; }
.milestone { display: flex; justify-content: space-between; gap: 1rem; }
.milestone b { display: block; text-align: right; color: var(--color-primary-strong); margin-bottom: 0.4rem; }
.mock-config { display: grid; gap: 0.75rem; margin: 0.75rem 0 1rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: 16px; background: rgba(255,253,248,0.6); }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mock-list { display: grid; gap: 0.75rem; margin-top: 0.75rem; }
.mock-row { padding: 0.9rem; border: 1px solid var(--color-line); border-radius: 14px; background: rgba(147, 182, 155, 0.14); }
.mock-row strong { display: block; color: var(--color-primary-strong); }
.mock-row p { margin: 0.35rem 0 0; color: var(--color-muted); line-height: 1.55; }
@media (max-width: 1180px) {
  .layout-grid,
  .steps,
  .grid.two {
    grid-template-columns: 1fr;
  }
  .detail-head,
  .milestone {
    flex-direction: column;
  }
  .milestone b {
    text-align: left;
  }
}
</style>
