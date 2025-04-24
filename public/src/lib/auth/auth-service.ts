import { AuthAdapter } from '@/lib/auth/auth-adapter';
import { SignUpParams, SignInWithPasswordParams, ResetPasswordParams } from '@/types/auth';
import { User } from '@/types/user';

export class AuthService {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      await AuthAdapter.signUp(params);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al registrarse' };
    }
  }

  async signInWithPassword(
    params: SignInWithPasswordParams,
  ): Promise<{ data?: User; error?: string }> {
    try {
      const { data } = await AuthAdapter.signInWithPassword(params);
      localStorage.setItem('custom-auth-token', data.token);
      return { data: data.user };
    } catch (error: any) {
      console.error('Error en login:', error);
      if (error.response) {
        return { error: error.response.data?.message || error.response.statusText };
      }
      if (error.request) return { error: 'No se recibió respuesta del servidor' };
      return { error: 'Error al configurar la solicitud' };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    try {
      await AuthAdapter.resetPassword(params);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al restablecer la contraseña' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      const response = await AuthAdapter.getUser();
      return { data: response.data.data as User | null };
    } catch (error: any) {
      return { data: null, error: 'No autenticado' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      await AuthAdapter.signOut();
      localStorage.removeItem('custom-auth-token');
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }

  async signInWithOAuth(): Promise<{ error?: string }> {
    return { error: 'Autenticación social no implementada' };
  }
}

export const authService = new AuthService();
