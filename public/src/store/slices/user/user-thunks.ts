import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import type { User, UpdateUserProfilePayload } from '@/types/user';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[UserThunks]' });

const fetchUserApi = async () => {
  const response = await api.get('/users/profile');
  return response;
};

const updateProfileApi = async (payload: UpdateUserProfilePayload) => {
  const response = await api.put('/user/profile', payload); // Ajusta la ruta según tu API
  return response;
};

const fetchAllUsersApi = async () => {
  const response = await api.get('/user/all'); 
  return response;
};

// Obtener perfil de usuario
export const refetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/refetchUser',
  async (_, { rejectWithValue }) => {
    try {
      logger.debug('Obteniendo perfil de usuario...');
      const response = await api.get<User>('/user/profile');
      logger.debug('Perfil obtenido:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error al obtener perfil:', error);
      const message = error instanceof Error ? error.message : 'Error al obtener perfil de usuario';
      return rejectWithValue(message);
    }
  }
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

export const fetchAllUsers = createAsyncThunk<User[]>(
  'user/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllUsersApi();
      logger.debug('Respuesta de fetchAllUsers:', response.data);
      return response.data as User[];
    } catch (err: unknown) {
      logger.error('Error al obtener usuarios:', err);

      let errorMessage = 'Error desconocido al obtener usuarios';
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

export const updateUserRole = createAsyncThunk<User, { userId: string; roleId: string }>(
  'user/updateRole',
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      const response = await api.put<User>(`/user/${userId}/role`, { roleId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar el rol');
    }
  }
);

export const suspendUser = createAsyncThunk<User, { userId: string; action: 'suspend' | 'activate'; reason?: string }>(
  'user/suspend',
  async ({ userId, action, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch<User>(`/user/${userId}/suspend`, { action, reason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al suspender/reactivar el usuario');
    }
  }
);

export const deleteUser = createAsyncThunk<{ _id: string }, string>(
  'user/delete',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ _id: string }>(`/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  }
);

// Crear un nuevo usuario
export const createUser = createAsyncThunk<User, {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: string;
}>(
  'user/create',
  async (userData, { rejectWithValue }) => {
    try {
      logger.debug('Creando nuevo usuario:', userData);
      const response = await api.post<{ message: string; user: User }>('/user', userData);
      logger.debug('Usuario creado:', response.data);
      return response.data.user;
    } catch (error: any) {
      logger.error('Error al crear usuario:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al crear el usuario');
    }
  }
);
