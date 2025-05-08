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
      // Aserción de tipo explícita para response.data
      return (response.data as User) ?? null;
    } catch (err: unknown) {
      logger.error('Failed to refetch user', err);

      // Manejo seguro del error
      let errorMessage = 'Unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (
        typeof err === 'object' &&
        err &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      ) {
        errorMessage = (err as { message: string }).message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

// Nuevo thunk para actualizar perfil
export const updateUserProfile = createAsyncThunk<User, UpdateUserProfilePayload>(
  'user/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await updateProfileApi(payload);
      // Añadir aserción de tipo explícita
      return response.data as User;
    } catch (err: unknown) {
      logger.error('Failed to update user profile', err);

      // Manejo seguro del error
      let errorMessage = 'Unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (
        typeof err === 'object' &&
        err &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      ) {
        errorMessage = (err as { message: string }).message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);
