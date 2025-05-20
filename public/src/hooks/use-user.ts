// src/hooks/use-user.ts
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function useUser() {
  const user = useSelector((state: RootState) => state.user.user);
  const error = useSelector((state: RootState) => state.user.error);
  const isLoading = useSelector((state: RootState) => state.user.isLoading);

  // Si necesitas mantener la misma interfaz que UserContextValue
  return {
    user,
    error,
    isLoading,
  };
}
