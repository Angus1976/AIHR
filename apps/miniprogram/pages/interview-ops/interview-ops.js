const { request } = require('../../utils/request.js');

function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

Page({
  data: {
    list: [],
    error: '',
    loading: false,
    hasToken: false,
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
  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const rows = await request({ url: '/interview-opportunities/me' });
      const list = Array.isArray(rows)
        ? rows.map((r) => ({
            ...r,
            timeText: formatDate(r.scheduledAt),
            company: r.jobPosting && r.jobPosting.enterprise ? r.jobPosting.enterprise.name : '',
            title: r.jobPosting ? r.jobPosting.title : '',
          }))
        : [];
      this.setData({ list });
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '加载失败',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  goServices() {
    wx.switchTab({ url: '/pages/services/services' });
  },
  async respond(e) {
    const { id, status } = e.currentTarget.dataset;
    if (!id || !status) return;
    this.setData({ loading: true, error: '' });
    try {
      await request({
        url: `/interview-opportunities/${id}/respond`,
        method: 'PATCH',
        data: {
          status,
          note: status === 'ACCEPTED' ? '我确认参加本场面试' : '我暂不参加本场面试',
        },
      });
      wx.showToast({ title: '已更新', icon: 'success' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: err && err.message ? err.message : '操作失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
