import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import type { User } from '@/types/user';
import { logger } from '@/lib/default-logger';

// Función para hacer fetch del usuario
const fetchUserApi = async () => {
  const response = await api.get('/users/profile'); // Ajusta la ruta según tu API
  return response;
};

// Thunk exportado
export const refetchUser = createAsyncThunk<User | null>(
  'user/refetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUserApi();
      return response.data ?? null;
    } catch (err: any) {
      logger.error('Failed to refetch user', err);
      return rejectWithValue(err.message);
    }
  },
);
