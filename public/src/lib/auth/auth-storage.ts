'use client';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const REDUX_STATE_KEY = 'redux_state';

export class AuthStorage {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      // Limpiar tokens específicos
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      
      // Limpiar estado de Redux
      localStorage.removeItem(REDUX_STATE_KEY);
      
      // Limpiar todas las claves que empiecen con 'auth_'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('auth_')) {
          localStorage.removeItem(key);
        }
      });

      // Limpiar cookies de autenticación
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Limpiar cualquier otra cookie que pueda estar relacionada
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name] = cookie.split('=');
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Forzar recarga del estado de Redux
      window.dispatchEvent(new Event('storage'));
    }
  }
}

// Crear y exportar una instancia
export const authStorage = new AuthStorage();

// También puedes exportar los métodos individualmente para usarlos como funciones
export const setToken = (token: string) => authStorage.setToken(token);
export const getToken = () => authStorage.getToken();
export const setRefreshToken = (token: string) => authStorage.setRefreshToken(token);
export const getRefreshToken = () => authStorage.getRefreshToken();
export const clearAuth = () => authStorage.clearAuth();
