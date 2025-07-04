import pb from '../client';
import { User, UserCollection } from '../types';

interface UsersServiceMethods {
  getUsers(options?: { page?: number; perPage?: number; filter?: string }): Promise<UserCollection>;
  getUser(id: string): Promise<User>;
  createUser(userData: Omit<User, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}

const UsersService: UsersServiceMethods = {
  async getUsers(options = {}): Promise<UserCollection> {
    const { page = 1, perPage = 30, filter = '' } = options;
    return await pb.collection('users').getList(page, perPage, {
      filter
    });
  },

  async getUser(id: string): Promise<User> {
    return await pb.collection('users').getOne(id);
  },

  async createUser(userData): Promise<User> {
    return await pb.collection('users').create(userData);
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return await pb.collection('users').update(id, userData);
  },

  async deleteUser(id: string): Promise<boolean> {
    await pb.collection('users').delete(id);
    return true;
  }
};

export default UsersService;
