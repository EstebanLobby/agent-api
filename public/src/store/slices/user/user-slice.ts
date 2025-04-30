'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { refetchUser } from './user-thunks';

interface UserState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  error: null,
  isLoading: false,
};

// Ya no necesitas definir refetchUser aquí porque lo estás importando

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
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { setCurrentUser, logout } = userSlice.actions;
export default userSlice.reducer;
