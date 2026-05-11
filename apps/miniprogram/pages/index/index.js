const { request } = require('../../utils/request.js');

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res),
      fail: reject,
    });
  });
}

const FLOW_STEP_COUNT = 3;

function flowNextLabelForIndex(activeIndex, count) {
  const labels = ['浏览品牌与主介绍', '进入在招岗位列表', '联调：健康检测、登录与支付试单'];
  if (count <= 0 || activeIndex < 0) return '';
  if (activeIndex < count - 1) {
    const next = labels[activeIndex + 1] || '继续向下滑动查看下一区块';
    return `建议下一步：${next}`;
  }
  return '主要区块已浏览，可在底部进入「服务」或「我的」';
}

function buildFlowDots(activeIndex, count = FLOW_STEP_COUNT) {
  return Array.from({ length: count }, (_, i) => ({
    tone: i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo',
  }));
}

Page({
  data: {
    health: null,
    error: '',
    logging: false,
    payResult: '',
    paying: false,
    unreadCount: 0,
    flowStepCount: FLOW_STEP_COUNT,
    flowActiveIndex: 0,
    flowDots: buildFlowDots(0, FLOW_STEP_COUNT),
    flowNextLabel: flowNextLabelForIndex(0, FLOW_STEP_COUNT),
  },
  onLoad() {
    this.checkHealth();
  },
  onReady() {
    this.scheduleFlowRefresh(true);
  },
  onShow() {
    this.loadUnreadCount();
    this.scheduleFlowRefresh(true);
  },
  onPageScroll() {
    this.scheduleFlowRefresh(false);
  },
  scheduleFlowRefresh(immediate) {
    if (this._flowTimer) {
      clearTimeout(this._flowTimer);
      this._flowTimer = null;
    }
    if (immediate) {
      this.refreshFlowActive();
      return;
    }
    this._flowTimer = setTimeout(() => {
      this._flowTimer = null;
      this.refreshFlowActive();
    }, 120);
  },
  _sameIndexFlowDots(prev, next) {
    if (!prev || !next || prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i += 1) {
      if (prev[i].tone !== next[i].tone) return false;
    }
    return true;
  },
  refreshFlowActive() {
    wx.createSelectorQuery()
      .in(this)
      .selectAll('.flow-anchor')
      .boundingClientRect((rects) => {
        if (!rects || !rects.length) return;
        const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const h = info.windowHeight || info.screenHeight;
        const center = h / 2;
        let best = 0;
        let bestDist = Infinity;
        rects.forEach((r, i) => {
          const mid = r.top + r.height / 2;
          const d = Math.abs(mid - center);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        const flowDots = buildFlowDots(best, rects.length);
        const flowNextLabel = flowNextLabelForIndex(best, rects.length);
        const { flowActiveIndex, flowStepCount, flowDots: oldDots, flowNextLabel: oldLabel } = this.data;
        if (
          flowActiveIndex === best
          && flowStepCount === rects.length
          && flowNextLabel === oldLabel
          && this._sameIndexFlowDots(oldDots, flowDots)
        ) {
          return;
        }
        this.setData({
          flowActiveIndex: best,
          flowDots,
          flowStepCount: rects.length,
          flowNextLabel,
        });
      })
      .exec();
  },
  async onPullDownRefresh() {
    try {
      await Promise.all([this.checkHealth(), this.loadUnreadCount()]);
      this.scheduleFlowRefresh(true);
    } finally {
      wx.stopPullDownRefresh();
    }
  },
  async loadUnreadCount() {
    const token = wx.getStorageSync('accessToken');
    if (!token || typeof token !== 'string') {
      this.setData({ unreadCount: 0 });
      return;
    }
    try {
      const data = await request({ url: '/notifications/unread-count' });
      this.setData({ unreadCount: Number(data.count || 0) });
    } catch {
      this.setData({ unreadCount: 0 });
    }
  },
  async checkHealth() {
    try {
      const data = await request({ url: '/health' });
      this.setData({ health: data, error: '' });
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '无法连接后端，请检查合法域名与 apiBase',
      });
    }
  },
  async onLogin() {
    this.setData({ logging: true, error: '' });
    try {
      const login = await wxLogin();
      const data = await request({
        url: '/auth/wechat/mini',
        method: 'POST',
        data: { code: login.code },
      });
      wx.setStorageSync('accessToken', data.accessToken);
      wx.showToast({ title: '登录成功', icon: 'success' });
      await this.loadUnreadCount();
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '登录失败，请检查服务端微信配置',
      });
    } finally {
      this.setData({ logging: false });
    }
  },
  async onPaySmoke() {
    this.setData({ paying: true, payResult: '', error: '' });
    try {
      const data = await request({
        url: '/payments/wechat/jsapi',
        method: 'POST',
        data: {
          amountFen: 1,
          kind: 'OTHER',
          description: '小程序联调·1分',
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
          payResult: `stub：orderId=${data.orderId}，请在管理端/数据库查看订单`,
        });
      }
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '预下单失败（需先登录且配置商户）',
      });
    } finally {
      this.setData({ paying: false });
    }
  },
});
