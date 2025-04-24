'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Button, Stack } from '@mui/material';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react/dist/ssr';
import EditUserForm from '@/components/dashboard/account/edit-user-form';

const mockUsers = [
  {
    id: '0001',
    avatar: 'https://i.pravatar.cc/150?img=12',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+54 9 11 1234-5678',
    role: 'admin',
    address: 'Av. Siempre Viva 123, Buenos Aires, Argentina',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    isSuspended: false,
    isActive: true,
  },
  {
    id: '0002',
    avatar: 'https://i.pravatar.cc/150?img=13',
    name: 'María Gómez',
    email: 'maria.gomez@example.com',
    phone: '+54 9 11 8765-4321',
    role: 'user',
    address: 'Calle Falsa 456, Córdoba, Argentina',
    createdAt: new Date('2023-11-10T15:00:00Z'),
    isSuspended: true,
    isActive: true,
  },
];

export default function Page(): React.JSX.Element {
  const router = useRouter();

  const user = mockUsers.find((u) => u.id === '0002') || mockUsers[0];

  const handleBack = () => router.back(); // Vuelve a la página anterior

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
