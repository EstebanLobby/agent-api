// src/hooks/use-user.ts
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function useUser() {
  const user = useSelector((state: RootState) => state.auth.user);
  const error = useSelector((state: RootState) => state.auth.error);
  const isLoading = useSelector((state: RootState) => state.auth.loading);

  // Si necesitas mantener la misma interfaz que UserContextValue
  return {
    user,
    error,
    isLoading,
  };
}
