'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Stack, TextField, Typography, Switch, FormControlLabel } from '@mui/material';

interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  createdAt: Date;
  isSuspended: boolean;
  isActive: boolean;
}

interface EditUserFormProps {
  user: User;
  isAdmin: boolean;
}

export default function EditUserForm({ user, isAdmin }: EditUserFormProps) {
  const { register, handleSubmit } = useForm({ defaultValues: user });

  const onSubmit = (data: any) => {
    console.log(data);
    // TODO: Aquí iría la lógica para actualizar el usuario
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <TextField label="Nombre" {...register('name')} fullWidth />
        <TextField label="Email" {...register('email')} fullWidth />
        <TextField label="Teléfono" {...register('phone')} fullWidth />
        <TextField label="Dirección" {...register('address')} fullWidth />

        {isAdmin ? (
          <Stack spacing={2}>
            <Typography variant="h6">Opciones de administrador</Typography>

            <FormControlLabel
              control={<Switch {...register('isActive')} defaultChecked={user.isActive} />}
              label="Activo"
            />

            <FormControlLabel
              control={<Switch {...register('isSuspended')} defaultChecked={user.isSuspended} />}
              label="Suspendido"
            />

            <TextField label="Rol" {...register('role')} fullWidth />
          </Stack>
        ) : null}

        <Button type="submit" variant="contained">
          Guardar cambios
        </Button>
      </Stack>
    </form>
  );
}
