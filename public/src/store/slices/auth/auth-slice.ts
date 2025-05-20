import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  error: null,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    authenticateSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    authenticateFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const {
  startLoading,
  authenticateSuccess,
  authenticateFailure,
  logout,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;
