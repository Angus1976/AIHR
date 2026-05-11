App({
  globalData: {
    /** 请在开发者工具「详情」或此处改为你的 HTTPS API 根路径（含 /v1） */
    apiBase: 'https://your-api.example.com/v1',
    /** 启动时窗口信息，供页面按屏宽做差异化逻辑（与全局 rpx 样式互补） */
    windowWidth: 0,
    windowHeight: 0,
    pixelRatio: 1,
    safeAreaInsets: null,
  },
  onLaunch() {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.globalData.windowWidth = info.windowWidth || info.screenWidth || 0;
      this.globalData.windowHeight = info.windowHeight || info.screenHeight || 0;
      this.globalData.pixelRatio = info.pixelRatio || 1;
      if (info.safeArea) {
        const sw = info.screenWidth || info.windowWidth || 0;
        const sh = info.screenHeight || info.windowHeight || 0;
        const sa = info.safeArea;
        this.globalData.safeAreaInsets = {
          top: sa.top,
          left: sa.left,
          right: sw - sa.right,
          bottom: sh - sa.bottom,
        };
      } else {
        this.globalData.safeAreaInsets = null;
      }
    } catch (_) {
      // 忽略极老基础库异常，页面仍依赖 rpx 与 WXSS 媒体查询适配
    }
  },
});
