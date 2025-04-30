import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { restoreSession } from '../store/slices/auth/auth-thunks';
import { selectIsInitialized } from '@/store/slices/auth/auth-selectors';

export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    const initAuth = async () => {
      await dispatch(restoreSession());
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [dispatch, isInitialized]);

  return { isInitialized };
};
