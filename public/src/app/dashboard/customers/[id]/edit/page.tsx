'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Card, Button, Stack } from '@mui/material';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react/dist/ssr';
import EditUserForm from '@/components/dashboard/customer/user/edit-user-form';

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

export default function EditUserPage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<(typeof mockUsers)[0] | null>(null);

  useEffect(() => {
    const foundUser = mockUsers.find((u) => u.id === id);
    setUser(foundUser || null);
  }, [id]);

  const handleBack = () => router.push('/dashboard/customers');

  if (!user) return <Typography>Cargando.....</Typography>;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Volver
        </Button>
        <Typography variant="h4">Editar Usuario</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <EditUserForm user={user} isAdmin={user.role === 'admin'} />
      </Card>
    </Stack>
  );
}
