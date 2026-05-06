const { request } = require('../../utils/request.js');

Page({
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
  data: {
    headline: '',
    skillsText: '',
    resumeMarkdown: '',
    error: '',
    msg: '',
    loading: false,
    saving: false,
    hasToken: false,
    emptyProfile: true,
  },
  onShow() {
    const token = wx.getStorageSync('accessToken');
    const hasToken = Boolean(token && typeof token === 'string');
    this.setData({ hasToken });
    if (hasToken) {
      void this.load();
    } else {
      this.setData({
        headline: '',
        skillsText: '',
        resumeMarkdown: '',
        emptyProfile: true,
        error: '',
      });
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
    this.setData({ loading: true, error: '', msg: '' });
    try {
      const p = await request({ url: '/me/profile' });
      if (!p) {
        this.setData({
          headline: '',
          skillsText: '',
          resumeMarkdown: '',
          emptyProfile: true,
        });
      } else {
        this.setData({
          headline: p.headline || '',
          skillsText: p.skillsText || '',
          resumeMarkdown: p.resumeMarkdown || '',
          emptyProfile: !(
            (p.headline && String(p.headline).trim()) ||
            (p.skillsText && String(p.skillsText).trim()) ||
            (p.resumeMarkdown && String(p.resumeMarkdown).trim())
          ),
        });
      }
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '加载失败',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  onHeadline(e) {
    this.setData({ headline: e.detail.value });
  },
  onSkills(e) {
    this.setData({ skillsText: e.detail.value });
  },
  onResume(e) {
    this.setData({ resumeMarkdown: e.detail.value });
  },
  async save() {
    this.setData({ saving: true, error: '', msg: '' });
    try {
      await request({
        url: '/me/profile',
        method: 'PUT',
        data: {
          headline: this.data.headline.trim(),
          skillsText: this.data.skillsText.trim(),
          resumeMarkdown: this.data.resumeMarkdown.trim(),
        },
      });
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({ msg: '档案已同步，岗位详情页可查看匹配参考。' });
      await this.load();
    } catch (e) {
      this.setData({
        error: e && e.message ? e.message : '保存失败',
      });
    } finally {
      this.setData({ saving: false });
    }
  },
});
