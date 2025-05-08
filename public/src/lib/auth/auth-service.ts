import { api } from '@/lib/api';
import { User } from '../../types/user';

interface AuthResponse {
  user: User;
  token: string;
}

// Iniciar sesión
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Asegúrate de enviar un objeto plano
    const credentials = {
      email, // o simplemente `email`
      password, // o `password`
    };

    const response = await api.post<AuthResponse>('/auth/sign-in', credentials, {
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
  name: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/sign-up', {
    email,
    name,
    password,
  });
  return response.data;
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
