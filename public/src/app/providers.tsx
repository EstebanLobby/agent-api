'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </QueryClientProvider>
  );
}
