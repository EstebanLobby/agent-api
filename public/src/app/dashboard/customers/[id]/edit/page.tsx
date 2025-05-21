'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Card, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAllUsers } from '@/store/slices/user/user-thunks';
import { selectAllUsers, selectAllUsersLoading } from '@/store/slices/user/user-selectors';
import EditUserForm from '@/components/dashboard/customer/user/edit-user-form';

export default function EditUserPage(): React.JSX.Element {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const isLoading = useAppSelector(selectAllUsersLoading);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const user = users.find((u) => u._id === id);

  if (isLoading) return <Typography>Cargando.....</Typography>;
  if (!user) return <Typography>Usuario no encontrado</Typography>;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Editar Usuario</Typography>

      <Card sx={{ p: 3 }}>
        <EditUserForm 
          user={user} 
          isAdmin={true} 
          onSave={() => {
            router.push(`/dashboard/customers/${id}`);
          }}
        />
      </Card>
    </Stack>
  );
}
