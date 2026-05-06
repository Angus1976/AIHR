const { request } = require('../../utils/request.js');

Page({
  data: {
    job: null,
    error: '',
    applying: false,
    pitch: '',
    match: null,
    matchPercent: null,
    matchHint: '',
  },
  onLoad(query) {
    const id = query.id;
    if (!id) {
      this.setData({ error: '缺少岗位 id' });
      return;
    }
    this.jobId = id;
    this.load();
  },
  async load() {
    this.setData({ error: '', match: null, matchPercent: null, matchHint: '' });
    try {
      const job = await request({ url: `/jobs/${this.jobId}/public` });
      this.setData({ job });
      await this.loadMatch();
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '加载失败',
      });
    }
  },
  async loadMatch() {
    const token = wx.getStorageSync('accessToken');
    if (!token || typeof token !== 'string') {
      this.setData({
        matchHint: '登录后可查看与岗位的匹配参考',
      });
      return;
    }
    try {
      const m = await request({ url: `/jobs/${this.jobId}/match-preview` });
      const pct =
        m && typeof m.score === 'number' ? Math.round(m.score * 1000) / 10 : null;
      this.setData({ match: m, matchPercent: pct, matchHint: '' });
    } catch (e) {
      const msg = e && e.message ? String(e.message) : '';
      this.setData({
        match: null,
        matchPercent: null,
        matchHint: msg.includes('仅求职者')
          ? '当前账号非求职者，无匹配预览'
          : '匹配参考暂不可用',
      });
    }
  },
  onPitchInput(e) {
    this.setData({ pitch: e.detail.value });
  },
  async apply() {
    if (!this.jobId) return;
    this.setData({ applying: true, error: '' });
    try {
      await request({
        url: `/jobs/${this.jobId}/applications`,
        method: 'POST',
        data: { pitch: this.data.pitch.trim() || undefined },
      });
      wx.showToast({ title: '投递成功', icon: 'success' });
      await this.load();
    } catch (e) {
      const msg = e && e.message ? e.message : '投递失败';
      wx.showToast({ title: msg, icon: 'none' });
    } finally {
      this.setData({ applying: false });
    }
  },
});
