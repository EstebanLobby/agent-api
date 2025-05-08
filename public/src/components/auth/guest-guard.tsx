'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Alert } from '@mui/material';

import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      logger.debug('[AuthGuard]: Esperando a que el usuario termine de cargar...');
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    // Si el usuario está autenticado y está en una ruta de autenticación, redirigir al dashboard
    if (user && pathname.startsWith('/auth/')) {
      logger.debug('[AuthGuard]: User is logged in, redirecting to dashboard');
      router.replace('/dashboard');
      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
  }, [user, error, isLoading, pathname, checkPermissions]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
