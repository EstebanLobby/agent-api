'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Card, Button, Stack, Divider } from '@mui/material';
import { PencilSimple as EditIcon } from '@phosphor-icons/react/dist/ssr';
import UserProfile from '@/components/dashboard/customer/user/user-profile';
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

export default function UserPage(): React.JSX.Element {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const foundUser = mockUsers.find((u) => u.id === id);
    setUser(foundUser || null);
  }, [id]);

  const handleEdit = () => {
    router.push(`/dashboard/customers/${id}/edit`);
  };

  if (!user) return <Typography>Cargando.....</Typography>;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography variant="h4">Usuario</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <UserProfile user={user} />

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
