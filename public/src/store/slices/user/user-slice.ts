'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { refetchUser, updateUserProfile, fetchAllUsers } from './user-thunks';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[UserSlice]' });

export interface UserState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  isUpdating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  allUsers: User[];
  allUsersLoading: boolean;
  allUsersError: string | null;
}

const initialState: UserState = {
  user: null,
  error: null,
  isLoading: false,
  isUpdating: false,
  updateError: null,
  updateSuccess: false,
  allUsers: [],
  allUsersLoading: false,
  allUsersError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      logger.debug('Actualizando usuario en el estado:', action.payload);
      state.user = action.payload;
      state.error = null;
    },
    logout: (state) => {
      logger.debug('Limpiando estado de usuario');
      state.user = null;
      state.error = null;
    },
    resetUpdateStatus: (state) => {
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        logger.debug('Cargando perfil de usuario...');
      })
      .addCase(refetchUser.fulfilled, (state, action) => {
        logger.debug('Perfil de usuario cargado:', action.payload);
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(refetchUser.rejected, (state, action) => {
        logger.error('Error al cargar perfil:', action.payload);
        state.error = action.payload as string;
        state.isLoading = false;
        state.user = null;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isUpdating = false;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateError = action.payload as string;
        state.isUpdating = false;
      })

      .addCase(fetchAllUsers.pending, (state) => {
        state.allUsersLoading = true;
        state.allUsersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
        state.allUsersLoading = false;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.allUsersError = action.payload as string;
        state.allUsersLoading = false;
      });
  },
});

export const { setCurrentUser, logout, resetUpdateStatus } = userSlice.actions;
export default userSlice.reducer;
