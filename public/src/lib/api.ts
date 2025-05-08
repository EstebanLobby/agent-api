import axios from 'axios'; // ✅ Agregá esto arriba del todo
import { authStorage } from './auth/auth-storage';

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ENV === 'testing'
      ? process.env.NEXT_TESTING_API_URL
      : process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Interceptor seguro para TypeScript
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = authStorage.getToken();
    return {
      ...config,
      headers: {
        ...config.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  }
  return config;
});
