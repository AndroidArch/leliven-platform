# PocketBase 集成指南

## 概述

本项目已成功集成 PocketBase 作为后端服务，提供了完整的认证、用户管理、事件管理和聊天功能。

## 目录结构

```
src/
├── plugins/pocketbase/          # PocketBase 插件
│   ├── index.ts                # PocketBase 实例配置
│   └── services.ts             # 服务类封装
├── store/
│   └── pocketbaseStore.ts      # PocketBase 状态管理
├── types/
│   └── pocketbase.ts           # 类型定义
└── views/auth/
    └── LoginView.vue           # 登录页面 (已更新)
```

## 环境配置

在项目根目录创建以下环境变量文件：

### .env.development

```env
# 开发环境配置
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_ENABLE_MSW=true
VITE_APP_TITLE=Materiv Admin (Dev)
VITE_APP_WEBSTORAGE_NAMESPACE=materiv-dev
```

### .env.production

```env
# 生产环境配置
VITE_POCKETBASE_URL=https://your-pocketbase-domain.com
VITE_ENABLE_MSW=false
VITE_APP_TITLE=Materiv Admin
VITE_APP_WEBSTORAGE_NAMESPACE=materiv
```

## PocketBase 服务器设置

### 1. 下载并启动 PocketBase

```bash
# 下载 PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.26.1/pocketbase_0.26.1_windows_amd64.zip

# 解压并启动
./pocketbase serve
```

### 2. 创建集合

在 PocketBase 管理界面创建以下集合：

#### users 集合 (认证集合)

- **类型**: Auth
- **字段**:
  - email (email, required)
  - username (text)
  - avatar (file)
  - role (select: admin, author, editor, maintainer, subscriber)
  - status (select: active, pending, inactive)
  - company (text)
  - job (text)
  - country (text)
  - city (text)
  - phone (text)

#### events 集合

- **类型**: Base
- **字段**:
  - title (text, required)
  - description (text)
  - start (date, required)
  - end (date, required)
  - allDay (bool)
  - calendar (select: Business, Personal, Family, Holiday, Meeting)
  - color (text)
  - url (url)

#### messages 集合

- **类型**: Base
- **字段**:
  - content (text, required)
  - sender (relation: users)
  - receiver (relation: users)
  - type (select: text, image, file)
  - read (bool)

## 使用方法

### 1. 在组件中使用认证

```vue
<script setup lang="ts">
import { usePocketBaseStore } from '@/store/pocketbaseStore';
import { useSnackbarStore } from '@/store/snackbarStore';

const pocketbaseStore = usePocketBaseStore();
const snackbarStore = useSnackbarStore();

// 登录
const handleLogin = async () => {
  try {
    await pocketbaseStore.login('user@example.com', 'password');
    snackbarStore.showMessage('登录成功', 'success');
  } catch (error) {
    snackbarStore.showMessage('登录失败', 'error');
  }
};

// 登出
const handleLogout = () => {
  pocketbaseStore.logout();
  snackbarStore.showMessage('已登出', 'info');
};

// 检查认证状态
const isAuthenticated = pocketbaseStore.isAuthenticated;
const currentUser = pocketbaseStore.currentUser;
</script>
```

### 2. 使用服务类

```vue
<script setup lang="ts">
import { UserService, EventService, ChatService } from '@/store/pocketbaseStore';

// 获取用户列表
const getUsers = async () => {
  try {
    const users = await UserService.getUsers(1, 20);
    console.log(users);
  } catch (error) {
    console.error('获取用户失败:', error);
  }
};

// 创建事件
const createEvent = async () => {
  try {
    const event = await EventService.createEvent({
      title: '会议',
      start: '2024-01-01T09:00:00Z',
      end: '2024-01-01T10:00:00Z',
      allDay: false,
      calendar: 'Business'
    });
    console.log('事件创建成功:', event);
  } catch (error) {
    console.error('创建事件失败:', error);
  }
};

// 发送消息
const sendMessage = async () => {
  try {
    const message = await ChatService.sendMessage({
      content: '你好！',
      sender: 'user-id',
      type: 'text'
    });
    console.log('消息发送成功:', message);
  } catch (error) {
    console.error('发送消息失败:', error);
  }
};
</script>
```

### 3. 路由保护

路由守卫已自动配置，未认证用户会被重定向到登录页面：

```typescript
// 路由守卫已自动处理认证检查
router.beforeEach(async (to) => {
  const pocketbaseStore = usePocketBaseStore();

  if (whiteList.includes(String(to.name))) {
    return true;
  } else {
    if (pocketbaseStore.isAuthenticated) {
      return true;
    } else {
      try {
        await pocketbaseStore.refreshAuth();
        return true;
      } catch (error) {
        return { name: 'Login' };
      }
    }
  }
});
```

## 功能特性

### ✅ 已实现功能

1. **认证系统**
   - 用户登录/登出
   - 管理员登录
   - 用户注册
   - Token 自动刷新
   - 认证状态持久化

2. **用户管理**
   - 获取用户列表
   - 获取单个用户
   - 更新用户信息
   - 删除用户

3. **事件管理**
   - 获取事件列表
   - 创建事件
   - 更新事件
   - 删除事件

4. **聊天功能**
   - 获取消息列表
   - 发送消息

5. **状态管理**
   - 认证状态管理
   - 用户信息管理
   - 错误处理
   - 加载状态

### 🔄 与 MSW 的集成

- 开发环境：使用 MSW 模拟 API
- 生产环境：使用真实的 PocketBase API
- 自动切换：根据环境变量 `VITE_ENABLE_MSW` 决定

## 开发建议

### 1. 类型安全

使用提供的类型定义确保类型安全：

```typescript
import type { IUser, IEvent, IMessage } from '@/types/pocketbase';

const user: IUser = {
  id: '1',
  email: 'user@example.com',
  username: 'username',
  role: 'admin',
  status: 'active',
  created: '2024-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z'
};
```

### 2. 错误处理

始终使用 try-catch 处理异步操作：

```typescript
try {
  await pocketbaseStore.login(email, password);
} catch (error) {
  // 处理错误
  console.error('登录失败:', error);
}
```

### 3. 状态管理

使用 Pinia store 管理全局状态：

```typescript
const pocketbaseStore = usePocketBaseStore();

// 获取状态
const isAuthenticated = pocketbaseStore.isAuthenticated;
const currentUser = pocketbaseStore.currentUser;
const isLoading = pocketbaseStore.isLoading;
const error = pocketbaseStore.error;
```

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 PocketBase 服务器是否运行
   - 验证环境变量 `VITE_POCKETBASE_URL` 是否正确

2. **认证失败**
   - 检查用户凭据是否正确
   - 确认用户已在 PocketBase 中创建

3. **类型错误**
   - 确保已导入正确的类型定义
   - 检查 PocketBase 集合结构是否匹配

### 调试技巧

1. 启用浏览器开发者工具查看网络请求
2. 检查 PocketBase 管理界面的日志
3. 使用 Vue DevTools 查看 Pinia store 状态

## 下一步

1. 根据业务需求扩展集合结构
2. 添加更多业务逻辑服务
3. 实现实时功能（WebSocket）
4. 添加文件上传功能
5. 实现更复杂的权限控制
