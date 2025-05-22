'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createLogger } from '@/lib/logger';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated, selectIsInitialized } from '@/store/slices/auth/auth-selectors';
import { selectCurrentUser } from '@/store/slices/user/user-selectors';
interface User {
  role: 'member' | 'owner' | 'admin';
}

const logger = createLogger({ prefix: '[GuestGuard]' });

const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up', '/auth/reset-password'];

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const user = useAppSelector(selectCurrentUser);
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && AUTH_ROUTES.includes(pathname)) {
      logger.debug('Usuario autenticado en ruta de auth, redirigiendo según rol');
      
      switch (user?.role.name) {
        case 'member':
          router.replace('/dashboard/integrations');
          break;
        case 'owner':
          router.replace('/dashboard/users');
          break;
        case 'admin':
          router.replace('/dashboard/customers');
          break;
        default:
          router.replace('/dashboard/integrations');
      }
    }
  }, [isAuthenticated, isInitialized, router, pathname, user]);

  // Si estamos en una ruta de autenticación, mostrar el contenido
  if (AUTH_ROUTES.includes(pathname)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return null;
}
