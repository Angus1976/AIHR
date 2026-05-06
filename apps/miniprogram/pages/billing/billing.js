const { request } = require('../../utils/request.js');

Page({
  data: {
    orders: [],
    refunds: [],
    error: '',
    loading: false,
    hasToken: false,
  },
  onShow() {
    const token = wx.getStorageSync('accessToken');
    const hasToken = Boolean(token && typeof token === 'string');
    this.setData({ hasToken });
    if (hasToken) void this.load();
  },
  async onPullDownRefresh() {
    try {
      await this.load();
    } finally {
      wx.stopPullDownRefresh();
    }
  },
  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const [orders, refunds] = await Promise.all([
        request({ url: '/orders/me' }),
        request({ url: '/orders/refund-requests/me' }),
      ]);
      this.setData({
        orders: Array.isArray(orders) ? orders : [],
        refunds: Array.isArray(refunds) ? refunds : [],
      });
    } catch (e) {
      this.setData({ error: e && e.message ? e.message : '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async refund(e) {
    const id = e.currentTarget.dataset.id;
    const amountFen = Number(e.currentTarget.dataset.amount || 0);
    if (!id || amountFen <= 0) return;
    try {
      await request({
        url: `/orders/${id}/refund-requests`,
        method: 'POST',
        data: { amountFen, reason: '小程序用户申请退款' },
      });
      wx.showToast({ title: '已提交退款', icon: 'success' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: err && err.message ? err.message : '提交失败', icon: 'none' });
    }
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
