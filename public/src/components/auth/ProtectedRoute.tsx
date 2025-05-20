'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { redirect } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { selectCurrentUser, selectCurrentUserLoading } from '@/store/slices/user/user-selectors';
import { createLogger } from '@/lib/logger';
import { paths } from '@/paths';

const logger = createLogger({ prefix: '[ProtectedRoute]' });

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'owner')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectCurrentUserLoading);

  useEffect(() => {
    logger.debug('Estado actualllll:', { currentUser, isLoading });
    
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading, currentUser]);

  // Si aún estamos verificando, mostramos un estado de carga
  if (isChecking || isLoading) {
    logger.debug('Verificando acceso...');
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando acceso...
        </Typography>
      </Box>
    );
  }

  // Si no hay usuario, redirigimos al login
  if (!currentUser) {
    logger.debug('Usuario no autenticado, redirigiendo a login');
    redirect(paths.auth.signIn);
  }

  // Si hay roles permitidos y el usuario no tiene uno de esos roles, redirigimos
  if (allowedRoles && !allowedRoles.includes(currentUser.role.name as 'admin' | 'owner')) {
    logger.debug(`Usuario no autorizado (rol: ${currentUser.role.name}), redirigiendo a unauthorized`);
    redirect(paths.auth.unauthorized);
  }

  logger.debug('Acceso permitido para usuario:', currentUser);
  return <>{children}</>;
}; 