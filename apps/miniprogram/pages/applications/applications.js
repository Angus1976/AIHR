const { request } = require('../../utils/request.js');

function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
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
      const rows = await request({ url: '/me/applications' });
      const list = Array.isArray(rows)
        ? rows.map((r) => ({
            ...r,
            createdAtText: formatDate(r.createdAt),
            enterpriseName: r.jobPosting && r.jobPosting.enterprise
              ? r.jobPosting.enterprise.name
              : '',
            jobTitle: r.jobPosting ? r.jobPosting.title : '',
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
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
  openJob(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/job-detail/job-detail?id=${id}` });
  },
});
