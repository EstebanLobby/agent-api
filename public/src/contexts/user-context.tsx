'use client';

import * as React from 'react';

import type { User } from '@/types/user';
import { logger } from '@/lib/default-logger';
import { useFetchUser } from '@/hooks/use-auth';

export interface UserContextValue {
  user: User | null;
  userData?: {
    permissions?: string[];
  };
  currentUser?: {
    role?: string;
  };
  error: string | null;
  isLoading: boolean;
  refetchUser: () => Promise<User | null>;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export const UserConsumer = UserContext.Consumer;
export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const { data: userData, error, isLoading, refetch } = useFetchUser();
  const [user, setUser] = React.useState<User | null | undefined>(undefined);

  React.useEffect(() => {
    if (userData !== undefined) {
      setUser(userData ?? null);
    }
  }, [userData]);

  // 1. Envuelve setCurrentUser en useCallback
  const setCurrentUser = React.useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  // 2. Envuelve handleRefetch en useCallback
  const handleRefetch = React.useCallback(async (): Promise<User | null> => {
    try {
      const response = await refetch();
      return response.data ?? null;
    } catch (err) {
      logger.error('Failed to refetch user', err);
      return null;
    }
  }, [refetch]);

  // 3. Envuelve logout en useCallback
  const logout = React.useCallback(() => {
    localStorage.removeItem('custom-auth-token');
    setUser(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      logger.error(error);
    }
  }, [error]);

  // 4. Memoiza el contexto con dependencias estables
  const contextValue = React.useMemo<UserContextValue>(
    () => ({
      user,
      error: error?.message ?? null,
      isLoading,
      refetchUser: handleRefetch,
      setCurrentUser,
      logout,
    }),
    [user, error, isLoading, handleRefetch, setCurrentUser, logout],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}
