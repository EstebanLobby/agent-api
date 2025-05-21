import { RootState } from '../../index';

export const selectCurrentUser = (state: RootState) => state.user.user;
export const selectCurrentUserLoading = (state: RootState) => state.user.isLoading;
export const selectCurrentUserError = (state: RootState) => state.user.error;

export const selectAllUsers = (state: RootState) => state.user.allUsers;
export const selectAllUsersLoading = (state: RootState) => state.user.allUsersLoading;
export const selectAllUsersError = (state: RootState) => state.user.allUsersError;

export const selectUserCreating = (state: RootState) => state.user.isCreating;
export const selectUserCreateError = (state: RootState) => state.user.createError;
export const selectUserCreateSuccess = (state: RootState) => state.user.createSuccess;

