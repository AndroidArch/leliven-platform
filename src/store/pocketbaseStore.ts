import { defineStore } from 'pinia';
import { AuthService, UserService, EventService, ChatService } from '@/plugins/pocketbase/services';

export interface IPocketBaseState {
  currentUser: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePocketBaseStore = defineStore('pocketbase', {
  state: (): IPocketBaseState => ({
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),

  getters: {
    getUser: (state) => state.currentUser,
    getAuthStatus: (state) => state.isAuthenticated,
    getLoadingStatus: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    // 初始化认证状态
    initAuth() {
      this.currentUser = AuthService.getCurrentUser();
      this.isAuthenticated = AuthService.isAuthenticated();
    },

    // 用户登录
    async login(email: string, password: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const authData = await AuthService.login(email, password);
        this.currentUser = authData.record;
        this.isAuthenticated = true;
        return authData;
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '登录失败';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 管理员登录
    async adminLogin(email: string, password: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const authData = await AuthService.adminLogin(email, password);
        this.currentUser = authData.record;
        this.isAuthenticated = true;
        return authData;
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '管理员登录失败';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 用户注册
    async register(email: string, password: string, passwordConfirm: string, data?: Record<string, unknown>) {
      this.isLoading = true;
      this.error = null;

      try {
        const record = await AuthService.register(email, password, passwordConfirm, data);
        return record;
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '注册失败';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 登出
    logout() {
      AuthService.logout();
      this.currentUser = null;
      this.isAuthenticated = false;
      this.error = null;
    },

    // 刷新认证
    async refreshAuth() {
      try {
        await AuthService.refresh();
        this.currentUser = AuthService.getCurrentUser();
        this.isAuthenticated = AuthService.isAuthenticated();
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '认证刷新失败';
        throw error;
      }
    },

    // 清除错误
    clearError() {
      this.error = null;
    }
  },

  persist: {
    key: 'pocketbase-store',
    storage: window.localStorage,
    paths: ['currentUser', 'isAuthenticated']
  }
});

// 导出服务类供组件使用
export { AuthService, UserService, EventService, ChatService };
