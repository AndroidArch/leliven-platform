import { defineStore } from 'pinia';
import AuthService from '@/api/pocketbase/services/auth.service';
import { User } from '@/api/pocketbase/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const authData = await AuthService.loginWithEmail(email, password);
        this.user = authData.record;
        this.isAuthenticated = true;
        return authData;
      } catch (error) {
        // TODO: 处理登录错误
        console.error('登录失败:', error);
      }
    },
    logout() {
      AuthService.logout();
      this.user = null;
      this.isAuthenticated = false;
    },
    checkAuth() {
      this.user = AuthService.getCurrentUser();
      this.isAuthenticated = AuthService.isAuthenticated();
    }
  }
});
