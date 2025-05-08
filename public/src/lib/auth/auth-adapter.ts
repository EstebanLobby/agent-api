import { api } from '@/lib/api';
import {
  SignUpParams,
  SignInWithPasswordParams,
  ResetPasswordParams,
  AuthResponse,
  ApiResponse,
} from '@/types/auth';
import { User } from '@/types/user';

export const AuthAdapter = {
  signUp: (params: SignUpParams) => api.post('/auth/register', params),

  signInWithPassword: (params: SignInWithPasswordParams) =>
    api.post<AuthResponse>('/auth/login', params, {
      headers: { 'Content-Type': 'application/json' },
    }),

  resetPassword: (params: ResetPasswordParams) => api.post('/auth/reset-password', params),

  getUser: () => api.get<ApiResponse<User | null>>('/user/me'),

  signOut: () => api.post('/auth/logout', {}, { withCredentials: true }),
};
