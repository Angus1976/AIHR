const { request } = require('../../utils/request.js');

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res),
      fail: reject,
    });
  });
}

Page({
  data: {
    health: null,
    error: '',
    logging: false,
    payResult: '',
    paying: false,
    unreadCount: 0,
  },
  onLoad() {
    this.checkHealth();
  },
  onShow() {
    this.loadUnreadCount();
  },
  async onPullDownRefresh() {
    try {
      await Promise.all([this.checkHealth(), this.loadUnreadCount()]);
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
