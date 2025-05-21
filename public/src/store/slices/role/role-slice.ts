import { createSlice } from '@reduxjs/toolkit';
import { fetchOwnerUsers, fetchAllRoles, assignUserToOwner, removeUserFromOwner } from './role-thunks';

export interface Role {
  id: string;
  name: string;
}

export interface OwnerUser {
  _id: string;
  username: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OwnerUsersResponse {
  owner: {
    id: string;
    username: string;
    email: string;
  };
  users: OwnerUser[];
  total: number;
}

interface RoleState {
  roles: Role[];
  ownerUsers: OwnerUsersResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  ownerUsers: null,
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    clearOwnerUsers: (state) => {
      state.ownerUsers = null;
    },
  },
  extraReducers: (builder) => {
    // fetchOwnerUsers
    builder
      .addCase(fetchOwnerUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerUsers = action.payload;
      })
      .addCase(fetchOwnerUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al obtener usuarios del owner';
      })
      // fetchAllRoles
      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al obtener roles';
      })
      // assignUserToOwner
      .addCase(assignUserToOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUserToOwner.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignUserToOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al asignar usuario al owner';
      })
      // removeUserFromOwner
      .addCase(removeUserFromOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUserFromOwner.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeUserFromOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al remover usuario del owner';
      });
  },
});

export const { clearRoleError, clearOwnerUsers } = roleSlice.actions;
export default roleSlice.reducer; 