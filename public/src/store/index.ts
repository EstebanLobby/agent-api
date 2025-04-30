import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/auth/auth-slice';
import userReducer from './slices/user/user-slice';
import createAuthMiddleware from './middleware/auth-middleware';

// Middleware para manejar tokens JWT

const authMiddleware = createAuthMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    // Agrega otros reducers aquí
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authMiddleware),
});

// Tipado para el store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
