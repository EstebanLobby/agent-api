'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Divider, Typography, Stack, Button } from '@mui/material';
import { PencilSimple as EditIcon } from '@phosphor-icons/react/dist/ssr';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/user/user-selectors';
import UserProfile from '@/components/dashboard/customer/user/user-profile';
import type { User } from '@/types/user';

export default function Page(): React.JSX.Element {
  const user = useSelector(selectCurrentUser);
  const router = useRouter();

  // Verificar que user sea del tipo User
  if (!user || Array.isArray(user)) {
    return (
      <Stack spacing={3}>
        <Typography>Error: Usuario no encontrado</Typography>
      </Stack>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/account/edit`);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography variant="h4">Usuario</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <UserProfile user={user as User} />

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<EditIcon size={20} />} onClick={handleEdit}>
            Editar
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
