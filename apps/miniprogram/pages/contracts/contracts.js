const { request } = require('../../utils/request.js');

Page({
  data: { list: [], error: '', loading: false, hasToken: false },
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
      const rows = await request({ url: '/contracts/me' });
      this.setData({ list: Array.isArray(rows) ? rows : [] });
    } catch (e) {
      this.setData({ error: e && e.message ? e.message : '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async sign(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    try {
      await request({ url: `/contracts/${id}/sign-stub`, method: 'POST', data: {} });
      wx.showToast({ title: '已签署', icon: 'success' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: err && err.message ? err.message : '签署失败', icon: 'none' });
    }
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
