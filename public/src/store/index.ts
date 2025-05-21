import { configureStore, Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer, { AuthState } from './slices/auth/auth-slice';
import userReducer, { UserState } from './slices/user/user-slice';
import roleReducer from './slices/role/role-slice';
import createAuthMiddleware from './middleware/auth-middleware';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[Store]' });

// Definir el tipo del estado raíz
export interface RootState {
  auth: AuthState;
  user: UserState;
  role: ReturnType<typeof roleReducer>;
}

// Middleware para manejar tokens JWT
const authMiddleware: Middleware = createAuthMiddleware();

// Middleware para persistencia manual
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Solo persistir en el cliente
  if (typeof window !== 'undefined') {
    // Si es una acción de logout, limpiar el estado persistido
    if (typeof action === 'object' && action !== null && 'type' in action && action.type === 'auth/logout') {
      localStorage.removeItem('redux_state');
      return result;
    }

    const state = store.getState();
    // Solo persistir si el usuario está autenticado
    if (state.auth.isAuthenticated && state.auth.token) {
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
        role: state.role,
      };
      localStorage.setItem('redux_state', JSON.stringify(persistData));
    } else {
      // Si no está autenticado, limpiar el estado persistido
      localStorage.removeItem('redux_state');
    }
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
        // Si no hay token, no restaurar el estado de autenticación
        if (!parsedState.auth?.token) {
          return {
            auth: {
              ...authReducer(undefined, { type: 'INIT' }),
              isInitialized: false,
            },
            user: {
              ...userReducer(undefined, { type: 'INIT' }),
            },
            role: roleReducer(undefined, { type: 'INIT' }),
          };
        }
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
          role: roleReducer(parsedState.role),
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
    role: roleReducer,
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
