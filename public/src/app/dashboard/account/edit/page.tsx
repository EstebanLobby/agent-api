'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Button, Stack } from '@mui/material';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react/dist/ssr';
import EditUserForm from '@/components/dashboard/account/edit-user-form';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/auth/auth-selectors';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const user = useSelector(selectUser);
  const handleBack = () => router.back();

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Volver
        </Button>
        <Typography variant="h4">Mi Perfil</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <EditUserForm user={user} onSave={handleBack} />
      </Card>
    </Stack>
  );
}
