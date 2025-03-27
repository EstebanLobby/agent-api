import axios from 'axios';

export const api = axios.create({
  //baseURL: 'http://localhost:5000/api', //URL de testing
  baseURL: 'https://agent-api-5ljd.onrender.com/api', //URL de producción
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('custom-auth-token');

  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
