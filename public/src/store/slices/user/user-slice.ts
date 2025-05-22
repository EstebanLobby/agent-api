'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { 
  refetchUser, 
  updateUserProfile, 
  fetchAllUsers, 
  updateUserRole, 
  suspendUser, 
  deleteUser,
  createUser 
} from './user-thunks';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[UserSlice]' });

interface UserState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  isUpdating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  allUsers: User[];
  allUsersLoading: boolean;
  allUsersError: string | null;
  isCreating: boolean;
  createError: string | null;
  createSuccess: boolean;
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
  isCreating: false,
  createError: null,
  createSuccess: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
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
    resetCreateStatus: (state) => {
      state.createError = null;
      state.createSuccess = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
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
      })

      .addCase(updateUserRole.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.allUsers = state.allUsers.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      .addCase(suspendUser.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(suspendUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.allUsers = state.allUsers.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.allUsers = state.allUsers.filter(user => user._id !== action.payload._id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = true;
        state.allUsers.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      });
  },
});

export const { setUser, logout, resetUpdateStatus, resetCreateStatus, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
