import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  startLoading,
  authenticateSuccess,
  authenticateFailure,
  logout,
  setInitialized,
} from './auth-slice';
import { AppDispatch, RootState } from '../../index';
import * as authService from '../../../lib/auth/auth-service';
import { authStorage } from '@/lib/auth/auth-storage';

// Iniciar sesión
export const signIn = createAsyncThunk<
  void,
  { email: string; password: string },
  { dispatch: AppDispatch; state: RootState }
>('auth/signIn', async ({ email, password }, { dispatch }) => {
  try {
    dispatch(startLoading());

    const response = await authService.signIn(email, password);
    const { user, token } = response;

    console.log(user);
    // Guardar token en localStorage
    authStorage.setToken(token);

    dispatch(authenticateSuccess({ user, token }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en la autenticación';
    dispatch(authenticateFailure(message));
    throw error;
  }
});

// Registrar nuevo usuario
export const signUp = createAsyncThunk<
  void,
  { email: string; name: string; password: string },
  { dispatch: AppDispatch; state: RootState }
>('auth/signUp', async ({ email, name, password }, { dispatch }) => {
  try {
    dispatch(startLoading());

    const response = await authService.signUp(email, name, password);
    const { user, token } = response;

    // Guardar token en localStorage
    authStorage.setToken(token);

    dispatch(authenticateSuccess({ user, token }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en el registro';
    dispatch(authenticateFailure(message));
    throw error;
  }
});

// Cerrar sesión
export const signOut = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
  'auth/signOut',
  async (_, { dispatch }) => {
    // Eliminar token del localStorage
    authStorage.clearAuth();

    // Limpiar estado de autenticación
    dispatch(logout());
  },
);

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { dispatch }) => {
  dispatch(startLoading());

  try {
    const token = authStorage.getToken();
    if (!token) {
      dispatch(setInitialized());
      return null;
    }

    const user = await authService.getUserProfile(token);
    dispatch(authenticateSuccess({ user, token }));

    return user;
  } catch (error) {
    authStorage.clearAuth();
    dispatch(logout());
    throw error;
  } finally {
    dispatch(setInitialized());
  }
});

// Restablecer contraseña
export const resetPassword = createAsyncThunk<
  void,
  { email: string },
  { dispatch: AppDispatch; state: RootState }
>('auth/resetPassword', async ({ email }, { dispatch }) => {
  try {
    dispatch(startLoading());
    await authService.resetPassword(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al restablecer la contraseña';
    dispatch(authenticateFailure(message));
    throw error;
  }
});
