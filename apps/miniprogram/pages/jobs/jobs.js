const { request } = require('../../utils/request.js');

Page({
  data: { list: [], error: '', loading: false },
  onShow() {
    this.load();
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
      const list = await request({ url: '/jobs/published' });
      this.setData({ list: Array.isArray(list) ? list : [] });
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '加载失败，请先登录',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/job-detail/job-detail?id=${id}` });
  },
});
