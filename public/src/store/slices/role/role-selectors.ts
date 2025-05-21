import { RootState } from '@/store';

export const selectRoles = (state: RootState) => state.role.roles;
export const selectOwnerUsers = (state: RootState) => state.role.ownerUsers;
export const selectRoleLoading = (state: RootState) => state.role.loading;
export const selectRoleError = (state: RootState) => state.role.error; 