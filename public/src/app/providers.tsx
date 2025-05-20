'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '../components/core/theme-provider/theme-provider';
import { LocalizationProvider } from '../components/core/localization-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LocalizationProvider>{children}</LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
