import { RootState } from '@/store'; // Asegurate de que este sea el path correcto

export const selectCurrentUser = (state: RootState) => state.user.user;
export const selectCurrentUserLoading = (state: RootState) => state.user.isLoading;
export const selectCurrentUserError = (state: RootState) => state.user.error;

export const selectAllUsers = (state: RootState) => state.user.allUsers;
export const selectAllUsersLoading = (state: RootState) => state.user.allUsersLoading;
export const selectAllUsersError = (state: RootState) => state.user.allUsersError;
