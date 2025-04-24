'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Stack, TextField, Avatar, Box, FormControlLabel, Switch, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Esquema de validación con Zod
const userSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto').max(50, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono muy corto').optional(),
  address: z.string().max(100, 'Dirección muy larga').optional(),
  avatar: z.string().url('URL inválida').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserFormProps {
  user: {
    id: string;
    avatar: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    address?: string;
    isSuspended: boolean;
    isActive: boolean;
  };
  onSave?: (data: UserFormData) => Promise<void>;
}

export default function EditUserForm({ user, onSave }: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar,
    },
  });

  const avatarUrl = watch('avatar');

  const onSubmit = async (data: UserFormData) => {
    try {
      if (onSave) {
        await onSave(data);
      }
      // Resetear el estado "dirty" después de guardar
      reset(data, { keepValues: true });
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Stack spacing={4}>
        {/* Sección de avatar */}
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar src={avatarUrl} sx={{ width: 80, height: 80 }} />
          <TextField
            label="URL del avatar"
            {...register('avatar')}
            fullWidth
            error={!!errors.avatar}
            helperText={errors.avatar?.message}
          />
        </Stack>

        {/* Campos editables */}
        <TextField
          label="Nombre completo"
          {...register('name')}
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          required
        />

        <TextField
          label="Email"
          type="email"
          {...register('email')}
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
          required
          disabled={user.role !== 'admin'} // Solo admin puede cambiar email
        />

        <TextField
          label="Teléfono"
          {...register('phone')}
          fullWidth
          error={!!errors.phone}
          helperText={errors.phone?.message}
        />

        <TextField
          label="Dirección"
          {...register('address')}
          fullWidth
          multiline
          rows={3}
          error={!!errors.address}
          helperText={errors.address?.message}
        />

        {/* Solo para admins */}
        {user.role === 'admin' && (
          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={user.isActive} disabled color="primary" />}
              label="Usuario activo"
            />
            <FormControlLabel
              control={<Switch checked={user.isSuspended} disabled color="secondary" />}
              label="Usuario suspendido"
            />
          </Stack>
        )}

        {isDirty ? <Alert severity="info">Tienes cambios sin guardar</Alert> : null}

        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          disabled={!isDirty}
          sx={{ alignSelf: 'flex-end' }}
        >
          Guardar cambios
        </LoadingButton>
      </Stack>
    </Box>
  );
}
