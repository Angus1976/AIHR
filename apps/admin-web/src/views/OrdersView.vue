<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, clearToken } from '../lib/api';

type OrderRow = {
  id: string;
  outTradeNo: string;
  status: string;
  amountFen: number;
  kind: string;
  description: string | null;
  createdAt: string;
  payer: { displayName: string; email: string | null };
};

type RefundRow = {
  id: string;
  amountFen: number;
  reason: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  order: { outTradeNo: string; amountFen: number; status: string };
  requestedBy: { displayName: string; email: string | null };
};

const router = useRouter();
const rows = ref<OrderRow[]>([]);
const refunds = ref<RefundRow[]>([]);
const err = ref('');
const msg = ref('');
const loading = ref(false);
const refundStatuses = ['SUBMITTED', 'APPROVED', 'REJECTED', 'REFUNDED'];

async function load() {
  err.value = '';
  loading.value = true;
  try {
    const [orders, refundRows] = await Promise.all([
      api<OrderRow[]>('/orders'),
      api<RefundRow[]>('/orders/refund-requests'),
    ]);
    rows.value = orders;
    refunds.value = refundRows;
  } catch (e) {
    err.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

async function reviewRefund(row: RefundRow, status: string) {
  err.value = '';
  msg.value = '';
  loading.value = true;
  try {
    await api(`/orders/refund-requests/${row.id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    msg.value = '退款申请已更新';
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : '审核失败';
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
      <h1>订单</h1>
      <div class="actions">
        <button type="button" class="btn ghost" :disabled="loading" @click="load">刷新</button>
        <button type="button" class="link" @click="logout">退出</button>
      </div>
    </div>
    <p class="muted">微信支付预下单产生的订单（最近 200 条）。</p>
    <p v-if="msg" class="ok">{{ msg }}</p>
    <p v-if="err" class="bad">{{ err }}</p>
    <div v-if="!rows.length && !loading" class="muted">暂无订单。</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>商户单号</th>
          <th>金额(分)</th>
          <th>类型</th>
          <th>状态</th>
          <th>付款人</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td class="mono">{{ r.outTradeNo }}</td>
          <td>{{ r.amountFen }}</td>
          <td>{{ r.kind }}</td>
          <td>{{ r.status }}</td>
          <td>{{ r.payer?.displayName ?? '—' }}</td>
          <td class="muted small">{{ r.createdAt }}</td>
        </tr>
      </tbody>
    </table>

    <section class="refunds">
      <h2>退款申请</h2>
      <p v-if="!refunds.length && !loading" class="muted">暂无退款申请。</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>商户单号</th>
            <th>申请人</th>
            <th>金额(分)</th>
            <th>状态</th>
            <th>审核</th>
            <th>原因</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in refunds" :key="r.id">
            <td class="mono">{{ r.order?.outTradeNo ?? '—' }}</td>
            <td>{{ r.requestedBy?.displayName ?? '—' }}</td>
            <td>{{ r.amountFen }}</td>
            <td>{{ r.status }}</td>
            <td>
              <select
                class="status-select"
                :disabled="loading"
                :value="r.status"
                @change="reviewRefund(r, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="s in refundStatuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
            <td>{{ r.reason ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </section>
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
}
.refunds {
  margin-top: 1.5rem;
}
.refunds h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
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
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid var(--color-line);
}
.mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
}
.small {
  font-size: 12px;
}
.status-select {
  font-size: 13px;
  padding: 0.25rem 0.35rem;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  background: var(--color-card);
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
