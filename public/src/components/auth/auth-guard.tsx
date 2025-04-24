'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUser();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user && !error) {
      logger.debug('[AuthGuard]: No user, redirecting');
      router.replace(paths.auth.signIn);
    }
  }, [isLoading, user, error, router]);

  if (isLoading || (!user && !error)) {
    return null; // ⏳ Esperamos a que cargue
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <>{children}</>;
}
