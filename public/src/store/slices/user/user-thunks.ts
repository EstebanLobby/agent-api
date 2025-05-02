import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import type { User, UpdateUserProfilePayload } from '@/types/user';
import { logger } from '@/lib/default-logger';

const fetchUserApi = async () => {
  const response = await api.get('/users/profile');
  return response;
};

const updateProfileApi = async (payload: UpdateUserProfilePayload) => {
  const response = await api.put('/user/profile', payload); // Ajusta la ruta según tu API
  return response;
};

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

// Nuevo thunk para actualizar perfil
export const updateUserProfile = createAsyncThunk<User, UpdateUserProfilePayload>(
  'user/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await updateProfileApi(payload);
      return response.data;
    } catch (err: any) {
      logger.error('Failed to update user profile', err);
      return rejectWithValue(err.message);
    }
  },
);
