import axios from 'axios'; // ✅ Agregá esto arriba del todo

export const api = axios.create({
  baseURL: 'https://checkia.lobby-digital.com/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Interceptor seguro para TypeScript
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('custom-auth-token');
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
