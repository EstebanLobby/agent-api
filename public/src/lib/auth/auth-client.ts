'use client';

import type { User } from '@/types/user';
import { api } from '@/lib/api';
import { signOut } from '@/store/slices/auth/auth-thunks';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ResetPasswordParams {
  email?: string;
  token?: string;
  newPassword?: string;
}

export interface ResetPasswordResponse {
  message: string;
  resetUrl?: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ data?: AuthResponse; error?: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', params);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error en el registro' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Autenticación social no implementada' };
  }

  async signInWithPassword(params: SignInWithPasswordParams) {
    return api.post<AuthResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ data?: any; error?: string }> {
    try {
      if (params.token && params.newPassword) {
        // Actualizar contraseña con token
        const response = await api.post('/auth/reset-password', {
          token: params.token,
          newPassword: params.newPassword,
        });
        return { data: response.data };
      }
      if (params.email) {
        // Solicitar reset de contraseña
        const response = await api.post('/auth/reset-password', { email: params.email });
        return { data: response.data };
      }
      return { error: 'Parámetros inválidos' };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al restablecer la contraseña' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      const response = await api.get<ApiResponse<User | null>>('/user/me');
      return { data: response.data as unknown as User | null };
    } catch (error: any) {
      return { data: null, error: 'No autenticado' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      await api.post('/auth/logout', {}, { withCredentials: false });
      signOut();
      localStorage.removeItem('auth_token');

      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }
}

export const authClient = new AuthClient();
