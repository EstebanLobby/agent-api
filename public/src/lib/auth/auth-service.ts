import { api } from '@/lib/api';
import { User } from '../../types/user';
import { AuthResponse } from './auth-client';
import { authClient } from './auth-client';

// Iniciar sesión
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const credentials = {
      email,
      password,
    };

    const response = await api.post<AuthResponse>('/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error de autenticación');
  }
};

// Registrar usuario
export const signUp = async (
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error en el registro');
  }
};

// Obtener perfil de usuario (validar token)
export const getUserProfile = async (token: string): Promise<User> => {
  const response = await api.get<User>('/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Restablecer contraseña
export const resetPassword = async (email: string): Promise<void> => {
  await api.post('/auth/reset-password', { email });
};

// Cerrar sesión
export const signOut = async (): Promise<void> => {
  try {
    const result = await authClient.signOut();
    if (result.error) {
      throw new Error(result.error);
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
  }
};
