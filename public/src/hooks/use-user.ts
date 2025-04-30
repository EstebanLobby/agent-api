// src/hooks/use-user.ts
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function useUser() {
  const user = useSelector((state: RootState) => state.auth.user);

  // Si necesitas mantener la misma interfaz que UserContextValue
  return {
    user,
    // isLoading: state.auth.isLoading,
    // error: state.auth.error
  };
}
