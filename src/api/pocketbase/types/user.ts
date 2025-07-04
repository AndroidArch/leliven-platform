export interface User {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  // 其他自定义字段
}

export interface UserCollection {
  totalItems: number;
  items: User[];
}
