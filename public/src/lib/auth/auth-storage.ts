'use client';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

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
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
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
