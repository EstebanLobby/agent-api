import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import type { Role, OwnerUser, OwnerUsersResponse } from './role-slice';

const logger = createLogger({ prefix: '[RoleThunks]' });

// Obtener usuarios de un owner específico
export const fetchOwnerUsers = createAsyncThunk(
  'role/fetchOwnerUsers',
  async (ownerId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/roles/owner/${ownerId}/users`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Error al obtener usuarios del owner');
    }
  }
);

// Obtener todos los roles
export const fetchAllRoles = createAsyncThunk<Role[], void, { rejectValue: string }>(
  'role/fetchAllRoles',
  async (_, { rejectWithValue }) => {
    try {
      logger.debug('Obteniendo todos los roles...');
      const response = await api.get<Role[]>('/roles');
      logger.debug('Roles obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('Error al obtener roles:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al obtener roles');
    }
  }
);

// Asignar un usuario a un owner
export const assignUserToOwner = createAsyncThunk<OwnerUser, { ownerId: string; userId: string }, { rejectValue: string }>(
  'role/assignUserToOwner',
  async ({ ownerId, userId }, { rejectWithValue }) => {
    try {
      logger.debug('Asignando usuario al owner:', { ownerId, userId });
      const response = await api.post<OwnerUser>(`/roles/owner/${ownerId}/users`, { userId });
      logger.debug('Usuario asignado:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('Error al asignar usuario al owner:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al asignar usuario al owner');
    }
  }
);

// Remover un usuario de un owner
export const removeUserFromOwner = createAsyncThunk<{ userId: string }, { ownerId: string; userId: string }, { rejectValue: string }>(
  'role/removeUserFromOwner',
  async ({ ownerId, userId }, { rejectWithValue }) => {
    try {
      logger.debug('Removiendo usuario del owner:', { ownerId, userId });
      const response = await api.post(`/roles/owner/${ownerId}/users/remove`, { userId: userId });
      logger.debug('Usuario removido:', response.data);
      return { userId };
    } catch (error: any) {
      logger.error('Error al remover usuario del owner:', error);
      return rejectWithValue(error.response?.data?.message || 'Error al remover usuario del owner');
    }
  }
);

// Enviar mensaje de WhatsApp como usuario
export const enviarMensajeWhatsApp = createAsyncThunk<
  { success: boolean; message: string },
  { userId: string; numero: string; mensaje: string },
  { rejectValue: string }
>(
  'role/enviarMensajeWhatsApp',
  async ({ userId, numero, mensaje }, { rejectWithValue }) => {
    try {
      logger.debug('Enviando mensaje de WhatsApp:', { userId, numero, mensaje });
      const response = await api.post<{ success: boolean; message: string }>('/admin/whatsapp/send-as-user', {
        userId,
        numero,
        mensaje
      });
      logger.debug('Mensaje enviado:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('Error al enviar mensaje de WhatsApp:', error);
      return rejectWithValue(error.response?.data?.error || 'Error al enviar mensaje de WhatsApp');
    }
  }
); 