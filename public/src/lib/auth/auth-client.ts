'use client';

import type { User } from '@/types/user';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth/auth-storage';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[AuthClient]' });

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
      logger.debug('Iniciando proceso de logout en auth-client...');
      const token = authStorage.getToken();

      // Primero limpiamos el estado local
      logger.debug('Limpiando estado local...');
      authStorage.clearAuth();

      // Si no hay token, terminamos aquí
      if (!token) {
        logger.debug('No hay token, finalizando logout...');
        return {};
      }

      // Intentamos notificar al servidor
      try {
        logger.debug('Notificando al servidor...');
        await api.post('/auth/logout', {}, { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        logger.debug('Servidor notificado exitosamente');
      } catch (error: any) {
        // Si hay error, lo registramos pero no es crítico
        logger.error('Error al notificar al servidor:', error);
      }

      logger.debug('Logout completado en auth-client');
      return {};
    } catch (error: any) {
      logger.error('Error general en logout:', error);
      // Asegurarnos de limpiar el estado local en caso de error
      authStorage.clearAuth();
      return { error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }
}

export const authClient = new AuthClient();
