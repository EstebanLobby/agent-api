'use client';

import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import type { Customer } from '@/components/dashboard/customer/customers-table';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchAllUsers } from '@/store/slices/user/user-thunks';
import { selectAllUsers, selectAllUsersLoading, selectAllUsersError } from '@/store/slices/user/user-selectors';
import { useRouter } from 'next/navigation';

export default function Page(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectAllUsersLoading);
  const error = useAppSelector(selectAllUsersError);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Adaptamos el formato para que encaje con Customer
  const customers: Customer[] = users.map((user) => ({
    id: user._id,
    name: user.username,
    email: user.email,
    phone: user.phone || '',
    avatar: user.photo || '/assets/avatar-placeholder.png',
    address: {
      city: '',
      country: '',
      state: '',
      street: user.address || '',
    },
    role: user.role,
    createdAt: new Date(user.createdAt),
    isSuspended: user.isSuspended || false,
  }));

  console.log(users)
  const paginatedCustomers = customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAddUser = () => {
    router.push('/dashboard/customers/new');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>  
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Clientes</Typography>
          </Stack>
        </Stack>
      
        {error ? <Typography color="error">{error}</Typography> : null}
        {loading ? (
          <Typography>Cargando usuarios...</Typography>
        ) : (
          <CustomersTable
            count={customers.length}
            page={page}
            rows={paginatedCustomers}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            onAddUser={handleAddUser}
          />
        )}
      </Stack>
    </ProtectedRoute>
  );
}
