// PocketBase 相关类型定义

// 用户类型
export interface IUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'admin' | 'author' | 'editor' | 'maintainer' | 'subscriber';
  status: 'active' | 'pending' | 'inactive';
  company?: string;
  job?: string;
  country?: string;
  city?: string;
  phone?: string;
  created: string;
  updated: string;
}

// 事件类型
export interface IEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  calendar: 'Business' | 'Personal' | 'Family' | 'Holiday' | 'Meeting';
  color?: string;
  url?: string;
  created: string;
  updated: string;
}

// 消息类型
export interface IMessage {
  id: string;
  content: string;
  sender: string;
  receiver?: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
  created: string;
  updated: string;
}

// 认证响应类型
export interface IAuthResponse {
  token: string;
  record: IUser;
  meta?: unknown;
}

// 管理员类型
export interface IAdmin {
  id: string;
  email: string;
  avatar?: string;
  created: string;
  updated: string;
}

// 分页响应类型
export interface IPaginationResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

// PocketBase 集合类型
export interface ICollection {
  id: string;
  name: string;
  type: 'auth' | 'base';
  system: boolean;
  schema: unknown[];
  indexes: unknown[];
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  options: unknown;
  created: string;
  updated: string;
}
