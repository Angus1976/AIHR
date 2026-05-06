import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const port = Number(process.env.VITE_ADMIN_WEB_PORT ?? 15174);

/** 与同仓 miniprogram-sim 一致：host 便于 127.0.0.1/局域网；见 README「本地前端排障」 */
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
