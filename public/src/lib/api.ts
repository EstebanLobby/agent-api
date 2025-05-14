import axios from 'axios';
import { authStorage } from './auth/auth-storage';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
