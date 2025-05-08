'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Card, Button, Stack } from '@mui/material';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react/dist/ssr';
import EditUserForm from '@/components/dashboard/customer/user/edit-user-form';
import type { User } from '@/types/user';

const mockUsers: User[] = [
  {
    _id: '0001',
    id: '0001',
    username: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+54 9 11 1234-5678',
    role: 'admin',
    address: 'Av. Siempre Viva 123, Buenos Aires, Argentina',
    photo: 'https://i.pravatar.cc/150?img=12',
    integrations: {
      whatsapp: true,
      facebook: false,
      instagram: false,
      telegram: false,
    },
    isActive: true,
    isSuspended: false,
    suspendedReason: null,
    suspendedUntil: null,
    deletedAt: null,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    __v: 0,
  },
  {
    _id: '0002',
    id: '0002',
    username: 'María Gómez',
    email: 'maria.gomez@example.com',
    phone: '+54 9 11 8765-4321',
    role: 'user',
    address: 'Calle Falsa 456, Córdoba, Argentina',
    photo: 'https://i.pravatar.cc/150?img=13',
    integrations: {
      whatsapp: false,
      facebook: true,
      instagram: false,
      telegram: false,
    },
    isActive: true,
    isSuspended: true,
    suspendedReason: 'Violación de términos',
    suspendedUntil: new Date('2024-02-15T10:00:00Z'),
    deletedAt: null,
    createdAt: new Date('2023-11-10T15:00:00Z'),
    updatedAt: new Date('2023-11-10T15:00:00Z'),
    __v: 0,
  },
];

export default function EditUserPage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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
