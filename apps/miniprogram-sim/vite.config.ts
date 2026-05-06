import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const port = Number(process.env.VITE_MINIPROGRAM_SIM_PORT ?? 15175);

/**
 * 本地访问：请用 `npm run dev` 后在浏览器打开终端里打印的 **http:// 地址**。
 * 不要双击打开 `index.html`（`file://` 无法加载 ESM，页面空白）。
 * —host：便于局域网 / WSL2 从宿主机访问；VITE_NO_OPEN=1 可关闭自动开浏览器
 */
export default defineConfig({
  plugins: [vue()],
  server: {
    port,
    strictPort: false,
    host: true,
    open: process.env.VITE_NO_OPEN === '1' ? false : true,
    proxy: {
      '/v1': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:3300',
        changeOrigin: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
      },
    },
  },
  preview: {
    port: port + 1,
    strictPort: false,
    host: true,
  },
});
