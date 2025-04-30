'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectIsAuthenticated, selectIsInitialized } from '@/store/slices/auth/auth-selectors';
import { restoreSession } from '@/store/slices/auth/auth-thunks';

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
    dispatch(restoreSession());
  }, [dispatch]);

  // Redirigir si no está autenticado y ya se inicializó la sesión
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
