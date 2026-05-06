<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

type Prompt = {
  id: string;
  key: string;
  title: string | null;
  body: string;
  version: number;
};

type RouteRow = {
  id: string;
  scenario: string;
  provider: string;
  modelName: string;
  baseUrl: string | null;
  apiKeyEnv: string | null;
  weight: number;
  enabled: boolean;
};

type StepInsight = {
  key: string;
  title: string | null;
  version: number;
  interactionCount: number;
  feedbackCount: number;
  avgRating: number | null;
  lowFeedbacks: Array<{
    id: string;
    rating: number | null;
    feedbackText: string | null;
    outputText: string;
  }>;
  latestOutput: string | null;
};

const prompts = ref<Prompt[]>([]);
const routes = ref<RouteRow[]>([]);
const insights = ref<StepInsight[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);

const defaultKey = 'default_system';
const promptBody = ref('');
const promptTitle = ref('系统提示');
const servicePrompts = ref([
  {
    key: 'service_step_PRE_CAREER_PLANNING',
    title: '职前规划',
    body: '',
  },
  {
    key: 'service_step_RESUME_OPTIMIZATION',
    title: '简历优化',
    body: '',
  },
  {
    key: 'service_step_INTERVIEW_COACHING',
    title: '面试辅导',
    body: '',
  },
  {
    key: 'service_step_INTERVIEW_CONFIRMATION',
    title: '面试确认',
    body: '',
  },
  {
    key: 'service_step_POST_OFFER_COACHING',
    title: '职后辅导',
    body: '',
  },
  {
    key: 'service_step_POST_CONVERSION_PLANNING',
    title: '职后规划',
    body: '',
  },
]);

const invokeResult = ref<Record<string, unknown> | null>(null);
const improveResult = ref<Record<string, unknown> | null>(null);

async function load() {
  err.value = '';
  loading.value = true;
  try {
    const [p, r, ins] = await Promise.all([
      api<Prompt[]>('/ai/prompts'),
      api<RouteRow[]>('/ai/routes'),
      api<StepInsight[]>('/ai/service-step-insights'),
    ]);
    prompts.value = p;
    routes.value = r;
    insights.value = ins;
    const def = p.find((x) => x.key === defaultKey);
    if (def) {
      promptBody.value = def.body;
      promptTitle.value = def.title ?? '系统提示';
    }
    servicePrompts.value = servicePrompts.value.map((sp) => {
      const existing = p.find((x) => x.key === sp.key);
      return {
        ...sp,
        title: existing?.title ?? sp.title,
        body: existing?.body ?? sp.body,
      };
    });
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

function insightFor(key: string) {
  return insights.value.find((x) => x.key === key);
}

async function improveServicePrompt(item: { key: string; title: string; body: string }, apply: boolean) {
  err.value = '';
  msg.value = '';
  improveResult.value = null;
  loading.value = true;
  try {
    improveResult.value = await api<Record<string, unknown>>(`/ai/service-step-prompts/${item.key}/improve`, {
      method: 'POST',
      body: JSON.stringify({ apply }),
    });
    msg.value = apply ? `已基于反馈优化并应用「${item.title}」提示词` : `已生成「${item.title}」优化建议`;
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '优化失败';
  } finally {
    loading.value = false;
  }
}

async function saveServicePrompt(item: { key: string; title: string; body: string }) {
  err.value = '';
  msg.value = '';
  if (!item.body.trim()) {
    err.value = `请填写「${item.title}」提示词正文`;
    return;
  }
  loading.value = true;
  try {
    await api('/ai/prompts', {
      method: 'POST',
      body: JSON.stringify({
        key: item.key,
        title: item.title,
        body: item.body,
      }),
    });
    msg.value = `已保存「${item.title}」提示词`;
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '保存失败';
  } finally {
    loading.value = false;
  }
}

async function savePrompt() {
  err.value = '';
  msg.value = '';
  if (!promptBody.value.trim()) {
    err.value = '提示词正文不能为空';
    return;
  }
  loading.value = true;
  try {
    await api('/ai/prompts', {
      method: 'POST',
      body: JSON.stringify({
        key: defaultKey,
        title: promptTitle.value.trim() || undefined,
        body: promptBody.value,
      }),
    });
    msg.value = '已保存提示词';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '保存失败';
  } finally {
    loading.value = false;
  }
}

async function runInvokeTest() {
  err.value = '';
  invokeResult.value = null;
  loading.value = true;
  try {
    invokeResult.value = await api<Record<string, unknown>>('/ai/invoke-test', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (e) {
    err.value = e instanceof Error ? e.message : '调用失败';
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
    <h1>AI 配置</h1>
    <p class="lead">
      提示词与模型路由已落库（PostgreSQL）；「连通性测试」走只读路由逻辑，真实推理仍为占位。
    </p>
    <div v-if="err" class="banner err">{{ err }}</div>
    <div v-if="msg" class="banner ok">{{ msg }}</div>

    <section class="card">
      <h2>系统提示词（{{ defaultKey }}）</h2>
      <label class="field">
        <span>标题</span>
        <input v-model="promptTitle" type="text" autocomplete="off" />
      </label>
      <label class="field">
        <span>正文</span>
        <textarea v-model="promptBody" rows="8" placeholder="写入系统级约束与风格…" />
      </label>
      <div class="actions">
        <button type="button" class="btn primary" :disabled="loading" @click="savePrompt">
          保存提示词
        </button>
        <button type="button" class="btn" :disabled="loading" @click="runInvokeTest">
          连通性测试
        </button>
      </div>
      <pre v-if="invokeResult" class="result">{{ JSON.stringify(invokeResult, null, 2) }}</pre>
    </section>

    <section class="card">
      <h2>6 步服务提示词</h2>
      <p class="muted prompt-intro">
        每个环节点击“获取服务建议”时，会读取这里的提示词并结合求职者档案、目标岗位、服务进度生成输出。
      </p>
      <div class="prompt-grid">
        <article v-for="item in servicePrompts" :key="item.key" class="prompt-card">
          <div class="prompt-head">
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.key }}</span>
            </div>
            <div class="prompt-actions">
              <button type="button" class="btn sm" :disabled="loading" @click="saveServicePrompt(item)">
                保存
              </button>
              <button type="button" class="btn sm ghost" :disabled="loading" @click="improveServicePrompt(item, false)">
                生成优化建议
              </button>
              <button type="button" class="btn sm ghost" :disabled="loading" @click="improveServicePrompt(item, true)">
                生成并应用
              </button>
            </div>
          </div>
          <div v-if="insightFor(item.key)" class="insight">
            <span>使用 {{ insightFor(item.key)?.interactionCount ?? 0 }}</span>
            <span>反馈 {{ insightFor(item.key)?.feedbackCount ?? 0 }}</span>
            <span>均分 {{ insightFor(item.key)?.avgRating ?? '—' }}</span>
          </div>
          <p v-if="insightFor(item.key)?.lowFeedbacks?.length" class="low-feedback">
            低分反馈：{{ insightFor(item.key)?.lowFeedbacks?.[0]?.feedbackText || '未填写原因' }}
          </p>
          <textarea v-model="item.body" rows="7" placeholder="写入该服务环节的角色、输出结构、注意事项…" />
        </article>
      </div>
      <pre v-if="improveResult" class="result">{{ JSON.stringify(improveResult, null, 2) }}</pre>
    </section>

    <section class="card">
      <h2>模型路由（当前租户）</h2>
      <p v-if="!routes.length" class="muted">暂无路由，请通过 API 或 seed 注入。</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>场景</th>
            <th>厂商</th>
            <th>模型</th>
            <th>权重</th>
            <th>启用</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in routes" :key="row.id">
            <td>{{ row.scenario }}</td>
            <td>{{ row.provider }}</td>
            <td>{{ row.modelName }}</td>
            <td>{{ row.weight }}</td>
            <td>{{ row.enabled ? '是' : '否' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="grid">
      <article class="card small">
        <h3>Skills 编排</h3>
        <p class="muted">拖拽流程（后续迭代）。</p>
      </article>
      <article class="card small">
        <h3>服务绑定</h3>
        <p class="muted">按环节/角色绑定 AI 与阈值（后续）。</p>
      </article>
      <article class="card small">
        <h3>日志与合规</h3>
        <p class="muted">PIPL 审计、脱敏导出（后续）。</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.page h1 {
  margin: 0 0 0.5rem;
}
.lead {
  color: var(--color-muted);
  margin-bottom: 1.25rem;
  max-width: 720px;
  line-height: 1.55;
}
.banner {
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 14px;
}
.banner.err {
  background: #fef3c7;
  color: #92400e;
}
.banner.ok {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1.25rem;
}
.card.small h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
}
.card h2 {
  margin: 0 0 1rem;
  font-size: 1.05rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
  font-size: 13px;
}
.field span {
  color: var(--color-muted);
}
input,
textarea {
  font: inherit;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--color-line);
  background: var(--color-card);
  color: var(--color-text);
}
textarea {
  resize: vertical;
  min-height: 140px;
}
.actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.btn {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--color-line);
  background: var(--color-card);
  cursor: pointer;
  font-size: 14px;
}
.btn.primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: oklch(0.98 0.008 80);
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.result {
  margin-top: 1rem;
  padding: 0.75rem;
  background: oklch(0.22 0.026 142);
  color: oklch(0.93 0.018 88);
  border-radius: 8px;
  font-size: 12px;
  overflow: auto;
}
.muted {
  margin: 0;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.5;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.table th,
.table td {
  text-align: left;
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid var(--color-line);
}
.table th {
  color: var(--color-muted);
  font-weight: 600;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.prompt-intro {
  margin-bottom: 1rem;
}
.prompt-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.prompt-card {
  border: 1px solid var(--color-line);
  border-radius: 16px;
  padding: 1rem;
  background: rgba(255, 253, 248, 0.62);
}
.prompt-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}
.prompt-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
}
.prompt-head strong {
  color: var(--color-primary-strong);
}
.prompt-head span {
  display: block;
  margin-top: 0.2rem;
  color: var(--color-muted);
  font-family: ui-monospace, monospace;
  font-size: 11px;
}
.btn.sm {
  padding: 0.25rem 0.6rem;
  font-size: 13px;
}
.btn.ghost {
  background: var(--color-card);
  color: var(--color-primary-strong);
  border-color: var(--color-line);
}
.insight {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.65rem;
}
.insight span {
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  background: var(--color-bg-deep);
  color: var(--color-primary-strong);
  font-size: 12px;
  font-weight: 700;
}
.low-feedback {
  margin: 0 0 0.65rem;
  padding: 0.55rem 0.65rem;
  border-radius: 12px;
  background: var(--color-warning-bg);
  color: var(--color-warning);
  font-size: 12px;
  line-height: 1.5;
}
</style>
