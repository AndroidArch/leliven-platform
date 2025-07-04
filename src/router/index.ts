import { createRouter, createWebHashHistory } from 'vue-router';
import PrivateRoutes from './private';
import PublicRoutes from './public';
import { useAuthStore } from '@/store/auth.store';

const whiteList = ['Login', 'Register', 'Forget', 'Reset'];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 };
    return { top: 0 };
  },
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/NotFound.vue')
    },
    PrivateRoutes,
    PublicRoutes
  ]
});

// 路由守卫
router.beforeEach(async (to) => {
  const routeName = String(to.name);
  const authStore = useAuthStore();

  if (whiteList.includes(routeName)) {
    return true;
  } else {
    // 检查 PocketBase 认证状态
    if (authStore.isAuthenticated) {
      return true;
    } else {
      // 尝试刷新认证
      try {
        await authStore.checkAuth();
        return true;
      } catch (error) {
        return { name: 'Login' };
      }
    }
  }
});
