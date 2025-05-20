import { configureStore, Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer, { AuthState } from './slices/auth/auth-slice';
import userReducer, { UserState } from './slices/user/user-slice';
import createAuthMiddleware from './middleware/auth-middleware';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[Store]' });

// Definir el tipo del estado raíz
export interface RootState {
  auth: AuthState;
  user: UserState;
}

// Middleware para manejar tokens JWT
const authMiddleware: Middleware = createAuthMiddleware();

// Middleware para persistencia manual
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Solo persistir en el cliente
  if (typeof window !== 'undefined') {
    const state = store.getState();
    // Persistir solo los datos necesarios
    const persistData = {
      auth: {
        token: state.auth.token,
        isAuthenticated: state.auth.isAuthenticated,
        isInitialized: state.auth.isInitialized,
      },
      user: {
        user: state.user.user,
      },
    };
    localStorage.setItem('redux_state', JSON.stringify(persistData));
  }
  
  return result;
};

// Función para cargar el estado persistido
const loadPersistedState = (): Partial<RootState> | undefined => {
  if (typeof window !== 'undefined') {
    try {
      const persistedState = localStorage.getItem('redux_state');
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        return {
          auth: {
            ...authReducer(undefined, { type: 'INIT' }),
            ...parsedState.auth,
            isInitialized: false, // Forzar reinicialización
          },
          user: {
            ...userReducer(undefined, { type: 'INIT' }),
            ...parsedState.user,
          },
        };
      }
    } catch (error) {
      logger.error('Error al cargar el estado persistido:', error);
    }
  }
  return undefined;
};

export const store = configureStore({
  reducer: {
    auth: authReducer as typeof authReducer & { (state: AuthState | undefined, action: any): AuthState },
    user: userReducer as typeof userReducer & { (state: UserState | undefined, action: any): UserState },
  },
  preloadedState: loadPersistedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones no serializables
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authMiddleware, persistenceMiddleware),
});

export type AppDispatch = typeof store.dispatch;

// Hooks tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Logging para desarrollo
if (process.env.NODE_ENV === 'development') {
  store.subscribe(() => {
    logger.debug('Estado actual:', store.getState());
  });
}
