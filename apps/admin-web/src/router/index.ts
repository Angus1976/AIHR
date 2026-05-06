import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '../lib/api';
import AiPanelView from '../views/AiPanelView.vue';
import AuditLogsView from '../views/AuditLogsView.vue';
import ComplianceView from '../views/ComplianceView.vue';
import ContractsView from '../views/ContractsView.vue';
import EnterpriseApplicationsView from '../views/EnterpriseApplicationsView.vue';
import EnterprisesView from '../views/EnterprisesView.vue';
import HomeView from '../views/HomeView.vue';
import JobsView from '../views/JobsView.vue';
import LoginView from '../views/LoginView.vue';
import JobApplicationsView from '../views/JobApplicationsView.vue';
import OrdersView from '../views/OrdersView.vue';
import PartnersView from '../views/PartnersView.vue';
import ProductsView from '../views/ProductsView.vue';
import SettingsView from '../views/SettingsView.vue';
import ServicePlansView from '../views/ServicePlansView.vue';
import SimulationView from '../views/SimulationView.vue';
import UsersView from '../views/UsersView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requireAuth: true },
    },
    {
      path: '/enterprises',
      name: 'enterprises',
      component: EnterprisesView,
      meta: { requireAuth: true },
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: JobsView,
      meta: { requireAuth: true },
    },
    {
      path: '/job-applications/:jobId',
      name: 'job-applications',
      component: JobApplicationsView,
      meta: { requireAuth: true },
    },
    {
      path: '/enterprise-applications/:enterpriseId',
      name: 'enterprise-applications',
      component: EnterpriseApplicationsView,
      meta: { requireAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
      meta: { requireAuth: true },
    },
    {
      path: '/service-plans',
      name: 'service-plans',
      component: ServicePlansView,
      meta: { requireAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requireAuth: true },
    },
    {
      path: '/partners',
      name: 'partners',
      component: PartnersView,
      meta: { requireAuth: true },
    },
    {
      path: '/compliance',
      name: 'compliance',
      component: ComplianceView,
      meta: { requireAuth: true },
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: ContractsView,
      meta: { requireAuth: true },
    },
    {
      path: '/ai-panel',
      name: 'ai-panel',
      component: AiPanelView,
      meta: { requireAuth: true },
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: AuditLogsView,
      meta: { requireAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requireAuth: true },
    },
    {
      path: '/simulation',
      name: 'simulation',
      component: SimulationView,
      meta: { requireAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requireAuth && !getToken()) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.path === '/login' && getToken()) {
    return { path: '/jobs' };
  }
  return true;
});

router.afterEach(() => {
  window.scrollTo(0, 0);
});

export default router;
