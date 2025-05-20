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
import { createLogger } from '@/lib/logger';
import { refetchUser } from '../user/user-thunks';
import { setCurrentUser } from '../user/user-slice';
import { api } from '@/lib/api';

const logger = createLogger({ prefix: '[AuthThunks]' });

// Iniciar sesión
export const signIn = createAsyncThunk<
  void,
  { email: string; password: string },
  { dispatch: AppDispatch; state: RootState }
>('auth/signIn', async ({ email, password }, { dispatch }) => {
  try {
    dispatch(startLoading());
    logger.debug('Iniciando proceso de login...');

    const response = await authService.signIn(email, password);
    const { user, token } = response;

    logger.debug('Login exitoso, guardando token...');
    authStorage.setToken(token);
    dispatch(authenticateSuccess({ token }));
    dispatch(setCurrentUser(user));
    
    logger.debug('Token guardado y estado actualizado');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en la autenticación';
    logger.error('Error en login:', message);
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

    authStorage.setToken(token);
    dispatch(authenticateSuccess({ token }));
    dispatch(setCurrentUser(user));
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
    try {
      logger.debug('Iniciando proceso de logout...');
      
      // 1. Primero limpiamos el estado de Redux
      logger.debug('Limpiando estado de Redux...');
      await Promise.all([
        dispatch(logout()),
        dispatch(setCurrentUser(null))
      ]);
      
      // 2. Luego limpiamos el almacenamiento local
      logger.debug('Limpiando almacenamiento local...');
      authStorage.clearAuth();
      localStorage.removeItem('redux_state');
      
      // 3. Finalmente notificamos al servidor
      const token = authStorage.getToken();
      if (token) {
        logger.debug('Notificando al servidor...');
        try {
          await authService.signOut();
          logger.debug('Servidor notificado exitosamente');
        } catch (error) {
          logger.error('Error al notificar al servidor:', error);
          // Continuamos con la limpieza local incluso si falla la notificación al servidor
        }
      }
      
      // 4. Esperamos a que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 5. Forzar recarga de la página para limpiar cualquier estado residual
      logger.debug('Forzando recarga de la página...');
      window.location.href = '/auth/sign-in';
      
    } catch (error) {
      logger.error('Error en logout:', error);
      // En caso de error, forzar limpieza y recarga
      authStorage.clearAuth();
      localStorage.removeItem('redux_state');
      await Promise.all([
        dispatch(logout()),
        dispatch(setCurrentUser(null))
      ]);
      window.location.href = '/auth/sign-in';
    }
  },
);

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { dispatch }) => {
  dispatch(startLoading());

  try {
    const token = authStorage.getToken();
    if (!token) {
      logger.debug('No se encontró token, finalizando restauración de sesión');
      dispatch(setInitialized());
      return null;
    }

    logger.debug('Token encontrado, obteniendo perfil de usuario...');
    const user = await dispatch(refetchUser()).unwrap();
    logger.debug('Perfil de usuario obtenido:', user);
    
    dispatch(authenticateSuccess({ token }));
    dispatch(setCurrentUser(user));
    
    return user;
  } catch (error) {
    logger.error('Error al restaurar sesión:', error);
    authStorage.clearAuth();
    dispatch(logout());
    dispatch(setCurrentUser(null));
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
