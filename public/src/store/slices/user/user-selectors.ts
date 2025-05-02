import { RootState } from '@/store'; // Asegurate de que este sea el path correcto

export const selectCurrentUser = (state: RootState) => state.user.user;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;
