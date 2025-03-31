'use client';

import type { User } from '@/types/user';
import { api } from '@/lib/api';

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

export interface ResetPasswordParams {
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      await api.post('/auth/register', params);
      return {}; // Retornar vacío si la petición es exitosa
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al registrarse' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Autenticación social no implementada' };
  }

  async signInWithPassword(
    params: SignInWithPasswordParams,
  ): Promise<{ data?: User; error?: string }> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', params);
      localStorage.setItem('custom-auth-token', data.token);
      // Aquí devuelves directamente el usuario
      return { data: data.user };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Credenciales inválidas' };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    try {
      await api.post('/auth/reset-password', params);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al restablecer la contraseña' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      const response = await api.get<ApiResponse<User | null>>('/auth/me');
      return { data: response.data.data };
    } catch (error: any) {
      return { data: null, error: 'No autenticado' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });

      localStorage.removeItem('custom-auth-token');

      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }
}

export const authClient = new AuthClient();
