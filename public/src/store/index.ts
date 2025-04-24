// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // podés agregar más reducers acá
  },
});

// Tipado de hooks personalizados (opcional pero recomendado)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
