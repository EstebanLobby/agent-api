import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

// Selector básico
export const selectAuth = (state: RootState) => state.auth;

// Selector memoizado (evita renders innecesarios)
export const selectIsAuthenticated = createSelector(selectAuth, (auth) => auth.isAuthenticated);
export const selectIsInitialized = createSelector(selectAuth, (auth) => auth.isInitialized);
