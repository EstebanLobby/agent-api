'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Divider, Typography, Stack, Button } from '@mui/material';
import {
  PencilSimple as EditIcon,
  Trash as TrashIcon,
  Prohibit as ProhibitIcon,
  ArrowLeft as BackIcon,
} from '@phosphor-icons/react/dist/ssr';
import UserProfile from '@/components/dashboard/customer/user/user-profile';

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
  const { id } = useParams();
  const router = useRouter();

  const user = mockUsers.find((u) => u.id === id) || mockUsers[0];

  const handleBack = () => router.push('/dashboard/customers');

  const handleEdit = () => {
    router.push(`/dashboard/customers/${user.id}/edit`);
  };

  const handleSuspend = () => {
    const confirmSuspend = window.confirm(`¿Seguro que deseas suspender a ${user.name}?`);
    if (confirmSuspend) {
      // TODO: Lógica para suspender al usuario
      alert(`${user.name} ha sido suspendido.`);
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar permanentemente a ${user.name}?`,
    );
    if (confirmDelete) {
      // TODO: Lógica para eliminar al usuario
      alert(`${user.name} ha sido eliminado.`);
      router.push('/dashboard/customers');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Volver
        </Button>
        <Typography variant="h4">Usuario</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <UserProfile user={user} />

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<EditIcon size={20} />} onClick={handleEdit}>
            Editar
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<ProhibitIcon size={20} />}
            onClick={handleSuspend}
          >
            Suspender
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<TrashIcon size={20} />}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
