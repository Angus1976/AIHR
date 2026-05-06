import { createApp } from 'vue';
import App from './App.vue';
import { setUnauthorizedHandler } from './lib/api';
import router from './router';
import './styles/theme.css';

setUnauthorizedHandler(() => {
  if (window.location.pathname === '/login') {
    return;
  }
  const p = window.location.pathname + window.location.search;
  void router.replace({ path: '/login', query: p !== '/login' ? { redirect: p } : undefined });
});

createApp(App).use(router).mount('#app');
