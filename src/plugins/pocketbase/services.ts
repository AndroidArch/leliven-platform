import pocketbase from './index';
import type { RecordAuthResponse } from 'pocketbase';

// 用户认证服务
export class AuthService {
  // 用户登录
  static async login(email: string, password: string): Promise<RecordAuthResponse<unknown>> {
    try {
      const authData = await pocketbase.collection('users').authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // 管理员登录
  static async adminLogin(email: string, password: string): Promise<RecordAuthResponse<unknown>> {
    try {
      const authData = await pocketbase.admins.authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  // 用户注册
  static async register(email: string, password: string, passwordConfirm: string, data?: Record<string, unknown>) {
    try {
      const record = await pocketbase.collection('users').create({
        email,
        password,
        passwordConfirm,
        ...(data || {})
      });
      return record;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // 登出
  static logout() {
    pocketbase.authStore.clear();
  }

  // 刷新认证
  static async refresh() {
    try {
      await pocketbase.collection('users').authRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // 获取当前用户
  static getCurrentUser() {
    return pocketbase.authStore.model;
  }

  // 检查是否已认证
  static isAuthenticated() {
    return pocketbase.authStore.isValid;
  }
}

// 用户管理服务
export class UserService {
  // 获取用户列表
  static async getUsers(page = 1, perPage = 20, filters?: string) {
    try {
      const records = await pocketbase.collection('users').getList(page, perPage, {
        filter: filters
      });
      return records;
    } catch (error) {
      console.error('Get users failed:', error);
      throw error;
    }
  }

  // 获取单个用户
  static async getUser(id: string) {
    try {
      const record = await pocketbase.collection('users').getOne(id);
      return record;
    } catch (error) {
      console.error('Get user failed:', error);
      throw error;
    }
  }

  // 更新用户
  static async updateUser(id: string, data: Record<string, unknown>) {
    try {
      const record = await pocketbase.collection('users').update(id, data);
      return record;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }

  // 删除用户
  static async deleteUser(id: string) {
    try {
      await pocketbase.collection('users').delete(id);
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }
}

// 事件管理服务
export class EventService {
  // 获取事件列表
  static async getEvents(page = 1, perPage = 20, filters?: string) {
    try {
      const records = await pocketbase.collection('events').getList(page, perPage, {
        filter: filters
      });
      return records;
    } catch (error) {
      console.error('Get events failed:', error);
      throw error;
    }
  }

  // 创建事件
  static async createEvent(data: Record<string, unknown>) {
    try {
      const record = await pocketbase.collection('events').create(data);
      return record;
    } catch (error) {
      console.error('Create event failed:', error);
      throw error;
    }
  }

  // 更新事件
  static async updateEvent(id: string, data: Record<string, unknown>) {
    try {
      const record = await pocketbase.collection('events').update(id, data);
      return record;
    } catch (error) {
      console.error('Update event failed:', error);
      throw error;
    }
  }

  // 删除事件
  static async deleteEvent(id: string) {
    try {
      await pocketbase.collection('events').delete(id);
    } catch (error) {
      console.error('Delete event failed:', error);
      throw error;
    }
  }
}

// 聊天服务
export class ChatService {
  // 获取聊天消息
  static async getMessages(page = 1, perPage = 50, filters?: string) {
    try {
      const records = await pocketbase.collection('messages').getList(page, perPage, {
        filter: filters,
        sort: '-created'
      });
      return records;
    } catch (error) {
      console.error('Get messages failed:', error);
      throw error;
    }
  }

  // 发送消息
  static async sendMessage(data: Record<string, unknown>) {
    try {
      const record = await pocketbase.collection('messages').create(data);
      return record;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }
}
