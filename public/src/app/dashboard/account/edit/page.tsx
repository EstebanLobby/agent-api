'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Button, Stack } from '@mui/material';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react/dist/ssr';
import EditUserForm from '@/components/dashboard/account/edit-user-form';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/auth/auth-selectors';
import type { User } from '@/types/user';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const user = useSelector(selectUser);

  // Verificar que user sea del tipo User
  if (!user || Array.isArray(user)) {
    return (
      <Stack spacing={3}>
        <Typography>Error: Usuario no encontrado</Typography>
      </Stack>
    );
  }

  // Modificar la función para que coincida con la firma esperada
  const handleBack = async (_data: {
    username: string;
    email: string;
    phone?: string;
    address?: string;
    photo?: string;
  }): Promise<void> => {
    router.back();
    return Promise.resolve();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Button startIcon={<BackIcon />} onClick={() => router.back()}>
          Volver
        </Button>
        <Typography variant="h4">Mi Perfil</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <EditUserForm user={user as User} onSave={handleBack} />
      </Card>
    </Stack>
  );
}
