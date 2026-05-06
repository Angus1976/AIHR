const { request } = require('../../utils/request.js');

Page({
  data: {
    orgName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    category: '培训机构',
    qualification: '',
    courseSummary: '',
    mine: [],
    error: '',
    msg: '',
    loading: false,
    hasToken: false,
  },
  onShow() {
    const token = wx.getStorageSync('accessToken');
    const hasToken = Boolean(token && typeof token === 'string');
    this.setData({ hasToken });
    if (hasToken) {
      void this.loadMine();
    } else {
      this.setData({ mine: [], error: '' });
    }
  },
  bind(e) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    this.setData({ [key]: e.detail.value });
  },
  async loadMine() {
    this.setData({ loading: true, error: '', msg: '' });
    try {
      const rows = await request({ url: '/partner-applications/me' });
      this.setData({ mine: Array.isArray(rows) ? rows : [] });
    } catch (e) {
      this.setData({ error: e && e.message ? e.message : '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async submit() {
    if (!this.data.orgName.trim() || !this.data.contactName.trim()) {
      wx.showToast({ title: '请填写机构与联系人', icon: 'none' });
      return;
    }
    this.setData({ loading: true, error: '', msg: '' });
    try {
      await request({
        url: '/partner-applications',
        method: 'POST',
        data: {
          orgName: this.data.orgName.trim(),
          contactName: this.data.contactName.trim(),
          contactPhone: this.data.contactPhone.trim() || undefined,
          contactEmail: this.data.contactEmail.trim() || undefined,
          category: this.data.category.trim(),
          qualification: this.data.qualification.trim() || undefined,
          courseSummary: this.data.courseSummary.trim() || undefined,
        },
      });
      wx.showToast({ title: '已提交', icon: 'success' });
      this.setData({
        msg: '入驻申请已提交，平台审核后会更新状态。',
        orgName: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        qualification: '',
        courseSummary: '',
      });
      await this.loadMine();
    } catch (e) {
      this.setData({ error: e && e.message ? e.message : '提交失败' });
    } finally {
      this.setData({ loading: false });
    }
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
