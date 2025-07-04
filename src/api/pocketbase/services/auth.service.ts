import pb from '../client';
import { User } from '../types';

interface AuthResponse {
  token: string;
  record: User;
}

interface AuthMethods {
  loginWithEmail(email: string, password: string): Promise<AuthResponse>;
  logout(): void;
  refreshAuth(): Promise<AuthResponse>;
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
}

const AuthService: AuthMethods = {
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    return await pb.collection('users').authWithPassword(email, password);
  },

  logout(): void {
    pb.authStore.clear();
  },

  async refreshAuth(): Promise<AuthResponse> {
    return await pb.collection('users').authRefresh();
  },

  getCurrentUser(): User | null {
    return pb.authStore.model as User | null;
  },

  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  }
};

export default AuthService;
