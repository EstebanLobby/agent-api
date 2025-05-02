'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { refetchUser, updateUserProfile } from './user-thunks';

interface UserState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  isUpdating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
}

const initialState: UserState = {
  user: null,
  error: null,
  isLoading: false,
  isUpdating: false,
  updateError: null,
  updateSuccess: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem('auth_token');
      state.user = null;
    },
    resetUpdateStatus: (state) => {
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Refetch User (existente)
      .addCase(refetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(refetchUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
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
      });
  },
});

export const { setCurrentUser, logout, resetUpdateStatus } = userSlice.actions;
export default userSlice.reducer;
