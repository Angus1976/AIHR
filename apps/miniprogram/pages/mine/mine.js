const { request } = require('../../utils/request.js');

Page({
  data: {
    unreadCount: 0,
  },
  onShow() {
    this.loadUnreadCount();
  },
  async onPullDownRefresh() {
    try {
      await this.loadUnreadCount();
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
});
