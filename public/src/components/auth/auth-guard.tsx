'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectIsAuthenticated, selectIsInitialized } from '@/store/slices/auth/auth-selectors';
import { restoreSession } from '@/store/slices/auth/auth-thunks';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: '[AuthGuard]' });

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  // Restaurar sesión al montar
  useEffect(() => {
    const initAuth = async () => {
      try {
        logger.debug('Iniciando restauración de sesión...');
        await dispatch(restoreSession());
        logger.debug('Sesión restaurada');
      } catch (error) {
        logger.error('Error al restaurar sesión:', error);
        // Si hay error, forzar redirección a login
        router.push('/auth/sign-in');
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [dispatch, isInitialized, router]);

  // Redirigir si no está autenticado y ya se inicializó la sesión
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      logger.debug('Usuario no autenticado, redirigiendo a login...');
      router.replace('/auth/sign-in');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Si no está inicializado, mostrar loading
  if (!isInitialized) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        
      </Box>
    );
  }

  // Si no está autenticado, no renderizar nada
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, renderizar children
  return <>{children}</>;
}
