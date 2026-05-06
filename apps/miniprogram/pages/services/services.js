const { request } = require('../../utils/request.js');

const CONSENT_TEXT =
  '我已阅读并同意职AI通服务说明、个人信息处理规则与支付相关条款，知晓当前为服务付费节点。';

function fenToYuan(fen) {
  return (Number(fen || 0) / 100).toFixed(2);
}

function statusText(status) {
  return {
    LOCKED: '未解锁',
    NOT_STARTED: '待开始',
    IN_PROGRESS: '进行中',
    DELIVERED: '已交付',
    CONFIRMED: '已确认',
    PAYABLE: '待处理',
    PAID: '已完成',
    WAIVED: '已减免',
    REFUNDED: '已退款',
  }[status] || status || '—';
}

function providerText(type) {
  return {
    PLATFORM: '平台服务',
    PARTNER: '协作服务',
    AI_ASSISTED: '平台服务',
    HYBRID: '综合服务',
  }[type] || type || '平台服务';
}

function neutralText(value) {
  return String(value || '')
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

function transportText(value) {
  return {
    TENCENT_MEETING: '腾讯会议',
    TRTC: '实时音视频',
    HYBRID: '会议 + 实时音视频',
  }[value] || value || '在线面试';
}

Page({
  data: {
    list: [],
    plan: null,
    steps: [],
    milestones: [],
    progressText: '0/6',
    error: '',
    payResult: '',
    loading: false,
    paying: false,
    hasToken: false,
    agreed: false,
    consentText: CONSENT_TEXT,
    complementByStep: {},
    ensureTargetRole: '',
    ensureSummary: '我确认进入 6 步就业服务路径，将按环节配合平台完成交付。',
    mockSessions: [],
  },
  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },
  goInterviewOps() {
    wx.navigateTo({ url: '/pages/interview-ops/interview-ops' });
  },
  async bookMockInterview() {
    if (!this.data.plan) return;
    this.setData({ loading: true, error: '' });
    try {
      await request({
        url: '/me/mock-interview/sessions',
        method: 'POST',
        data: { servicePlanId: this.data.plan.id },
      });
      wx.showToast({ title: '已创建腾讯会议（占位）', icon: 'success' });
      await this.load();
    } catch (e) {
      wx.showToast({ title: e && e.message ? e.message : '预约失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  onShow() {
    const token = wx.getStorageSync('accessToken');
    const hasToken = Boolean(token && typeof token === 'string');
    this.setData({ hasToken });
    if (hasToken) {
      void this.load();
    } else {
      this.setData({ list: [], error: '' });
    }
  },
  async onPullDownRefresh() {
    try {
      await this.load();
    } finally {
      wx.stopPullDownRefresh();
    }
  },
  onEnsureTargetRole(e) {
    this.setData({ ensureTargetRole: e.detail.value });
  },
  onEnsureSummary(e) {
    this.setData({ ensureSummary: e.detail.value });
  },
  onComplementInput(e) {
    const sid = e.currentTarget.dataset.sid;
    if (!sid) return;
    const next = { ...(this.data.complementByStep || {}) };
    next[sid] = e.detail.value;
    this.setData({ complementByStep: next });
  },
  async ensureMyPlan() {
    this.setData({ loading: true, error: '' });
    try {
      await request({
        url: '/service-plans/me/ensure',
        method: 'POST',
        data: {
          targetRole: (this.data.ensureTargetRole || '').trim() || undefined,
          summary: (this.data.ensureSummary || '').trim() || undefined,
        },
      });
      wx.showToast({ title: '服务计划已生成', icon: 'success' });
      await this.load();
    } catch (e) {
      wx.showToast({ title: e && e.message ? e.message : '创建失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async load() {
    this.setData({ loading: true, error: '', payResult: '' });
    try {
      const [rows, plan, mockSessionsRaw] = await Promise.all([
        request({ url: '/service-products?audience=JOB_SEEKER' }),
        request({ url: '/service-plans/me' }).catch(() => null),
        request({ url: '/me/mock-interview/sessions' }).catch(() => []),
      ]);
      const mockSessions = Array.isArray(mockSessionsRaw) ? mockSessionsRaw : [];
      const list = Array.isArray(rows)
        ? rows.map((p) => ({
            ...p,
            priceText: `¥${fenToYuan(p.amountFen)}`,
          }))
        : [];
      const steps = plan && Array.isArray(plan.steps)
        ? plan.steps.map((s, idx) => ({
            ...s,
            no: String(idx + 1).padStart(2, '0'),
            stepKey: s.key,
            valueProposition: neutralText(s.valueProposition),
            statusText: statusText(s.status),
            providerText: providerText(s.providerType),
            checklistText: Array.isArray(s.checklist) ? neutralText(s.checklist.slice(0, 3).join(' / ')) : '',
            deliverableSummary: neutralText(s.deliverableSummary),
            latestOutput: Array.isArray(s.interactions) && s.interactions[0] ? neutralText(s.interactions[0].outputText) : '',
            latestInteractionId: Array.isArray(s.interactions) && s.interactions[0] ? s.interactions[0].id : '',
            latestFeedbackRating: Array.isArray(s.interactions) && s.interactions[0] ? s.interactions[0].feedbackRating : null,
            canConfirm: s.status === 'DELIVERED',
            flowPre: s.key === 'PRE_CAREER_PLANNING',
            flowResume: s.key === 'RESUME_OPTIMIZATION',
            flowCoach: s.key === 'INTERVIEW_COACHING',
            flowConfirm: s.key === 'INTERVIEW_CONFIRMATION',
            mockLatest: s.key === 'INTERVIEW_COACHING' && mockSessions[0]
              ? {
                  ...mockSessions[0],
                  transportText: transportText(mockSessions[0].transport),
                  sceneText: mockSessions[0].vrSceneName || (mockSessions[0].sceneMode === 'VR' ? '沉浸式面试场景' : '标准面试场景'),
                  independentRules: Array.isArray(mockSessions[0].antiAssistRules)
                    ? mockSessions[0].antiAssistRules.slice(0, 3).join(' / ')
                    : '请保持摄像头开启并独立作答；作答区不展示实时答案提示。',
                  safeNote: neutralText(mockSessions[0].robotSideNote),
                }
              : null,
          }))
        : [];
      const done = steps.filter((s) => s.status === 'DELIVERED' || s.status === 'CONFIRMED').length;
      const milestones = plan && Array.isArray(plan.milestones)
        ? plan.milestones.map((m) => ({
            ...m,
            statusText: statusText(m.status),
            amountText: m.amountFen ? `¥${fenToYuan(m.amountFen)}` : '无需付款',
            canPay: m.status === 'PAYABLE' && Number(m.amountFen || 0) > 0,
          }))
        : [];
      this.setData({ list, plan, steps, milestones, progressText: `${done}/6`, mockSessions });
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '加载失败',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  onAgree(e) {
    this.setData({ agreed: e.detail.value.includes('agree') });
  },
  async requestStep(e) {
    const stepId = e.currentTarget.dataset.id;
    if (!this.data.plan || !stepId) return;
    this.setData({ loading: true, error: '' });
    try {
      const extra =
        this.data.complementByStep && this.data.complementByStep[stepId]
          ? String(this.data.complementByStep[stepId]).trim()
          : '';
      const inputText = extra
        ? `${extra}\n\n请结合平台已采集的投递、面试与档案信息，输出本环节可执行建议。`
        : '请基于我的档案与平台已采集的投递、面试等信息，生成本环节服务建议。';
      await request({
        url: `/service-plans/${this.data.plan.id}/steps/${stepId}/request`,
        method: 'POST',
        data: { inputText },
      });
      wx.showToast({ title: '服务建议已生成', icon: 'success' });
      await this.load();
    } catch (e) {
      wx.showToast({ title: e && e.message ? e.message : '生成失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async confirmStep(e) {
    const stepId = e.currentTarget.dataset.id;
    if (!this.data.plan || !stepId) return;
    this.setData({ loading: true, error: '' });
    try {
      await request({
        url: `/service-plans/${this.data.plan.id}/steps/${stepId}/confirm`,
        method: 'POST',
        data: {},
      });
      wx.showToast({ title: '已确认该环节', icon: 'success' });
      await this.load();
    } catch (e) {
      wx.showToast({ title: e && e.message ? e.message : '确认失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async feedbackStep(e) {
    const stepId = e.currentTarget.dataset.stepId;
    const interactionId = e.currentTarget.dataset.interactionId;
    const rating = Number(e.currentTarget.dataset.rating);
    if (!this.data.plan || !stepId || !interactionId || !rating) return;
    this.setData({ loading: true, error: '' });
    try {
      await request({
        url: `/service-plans/${this.data.plan.id}/steps/${stepId}/interactions/${interactionId}/feedback`,
        method: 'PATCH',
        data: {
          rating,
          feedbackText: rating >= 4 ? '该建议有帮助' : '该建议需要进一步改进',
        },
      });
      wx.showToast({ title: '反馈已提交', icon: 'success' });
      await this.load();
    } catch (e) {
      wx.showToast({ title: e && e.message ? e.message : '反馈失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
  async pay(e) {
    const product = this.data.list.find((p) => p.id === e.currentTarget.dataset.id);
    if (!product) return;
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选同意条款', icon: 'none' });
      return;
    }
    this.setData({ paying: true, error: '', payResult: '' });
    try {
      await request({
        url: '/consents',
        method: 'POST',
        data: {
          purpose: 'SERVICE_PAYMENT',
          version: 'mvp-2026-04',
          content: CONSENT_TEXT,
          metadata: {
            productId: product.id,
            productCode: product.code,
          },
        },
      });
      const data = await request({
        url: '/payments/wechat/jsapi',
        method: 'POST',
        data: {
          productId: product.id,
          amountFen: product.amountFen,
          kind: product.orderKind,
          description: product.name,
        },
      });
      if (data.mode === 'live' && data.timeStamp && data.paySign) {
        await new Promise((resolve, reject) => {
          wx.requestPayment({
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: resolve,
            fail: reject,
          });
        });
        this.setData({ payResult: '已调起微信支付' });
      } else {
        this.setData({
          payResult: `stub：orderId=${data.orderId}，金额 ${fenToYuan(data.amountFen)} 元`,
        });
      }
    } catch (e2) {
      this.setData({
        error: e2 && e2.message ? e2.message : '支付失败',
      });
    } finally {
      this.setData({ paying: false });
    }
  },
  async payMilestone(e) {
    const milestone = this.data.milestones.find((m) => m.id === e.currentTarget.dataset.id);
    if (!milestone) return;
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选同意条款', icon: 'none' });
      return;
    }
    this.setData({ paying: true, error: '', payResult: '' });
    try {
      await request({
        url: '/consents',
        method: 'POST',
        data: {
          purpose: 'SERVICE_PAYMENT_MILESTONE',
          version: 'mvp-2026-04',
          content: CONSENT_TEXT,
          metadata: {
            milestoneId: milestone.id,
            milestoneTitle: milestone.title,
          },
        },
      });
      const data = await request({
        url: '/payments/wechat/jsapi',
        method: 'POST',
        data: {
          milestoneId: milestone.id,
          amountFen: milestone.amountFen,
          kind: 'SEEKER_SERVICE_FEE',
          description: milestone.title,
        },
      });
      if (data.mode === 'live' && data.timeStamp && data.paySign) {
        await new Promise((resolve, reject) => {
          wx.requestPayment({
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: resolve,
            fail: reject,
          });
        });
        this.setData({ payResult: '已调起微信支付' });
      } else {
        this.setData({
          payResult: data.paid
            ? `本地模拟支付成功：${milestone.title}`
            : `stub：orderId=${data.orderId}，金额 ${fenToYuan(data.amountFen)} 元`,
        });
      }
      await this.load();
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '支付失败',
      });
    } finally {
      this.setData({ paying: false });
    }
  },
});
