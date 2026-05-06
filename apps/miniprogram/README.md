# 职AI通 · 原生微信小程序

1. 用微信开发者工具打开本目录。
2. 在 `project.config.json` 将 `appid` 改为你公众平台的小程序 AppID。
3. 在 `app.js` 的 `globalData.apiBase` 填入 HTTPS API 根路径（形如 `https://api.example.com/v1`），并在公众平台配置**合法域名**。
4. 本地调试可在开发者工具中临时关闭「不校验合法域名」；真机与体验版必须 HTTPS + 白名单。
