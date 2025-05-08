import axios from 'axios';
import { authStorage } from './auth/auth-storage';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_ENV === 'testing') {
    return process.env.NEXT_TESTING_API_URL;
  }
  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    return 'https://agent-api-daw5.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
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
