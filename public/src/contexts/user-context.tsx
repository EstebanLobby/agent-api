'use client';

import * as React from 'react';



import type { User } from '@/types/user';
import { logger } from '@/lib/default-logger';
import { useFetchUser } from '@/hooks/use-auth';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  refetchUser?: () => Promise<unknown>;
  setCurrentUser?: (user: User | null) => void;
  logout: () => void;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const { data: userData, error, isLoading, refetch } = useFetchUser();

  const [user, setUser] = React.useState<User | null>(userData);

  // 🔥 Este useEffect es esencial
  React.useEffect(() => {
    setUser(userData ?? null);
  }, [userData]);

  const setCurrentUser = (newUser: User | null) => setUser(newUser);

  React.useEffect(() => {
    if (error) {
      logger.error(error);
    }
  }, [error]);

  const logout = () => {
    localStorage.removeItem('custom-auth-token');
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        error: error?.message ?? null,
        isLoading,
        refetchUser: refetch,
        setCurrentUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}


export const UserConsumer = UserContext.Consumer;