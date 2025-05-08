'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Stack,
  TextField,
  Avatar,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateUserProfile } from '@/store/slices/user/user-thunks';
import { useAppDispatch } from '@/store';
import type { User } from '@/types/user';

// Esquema de validación con Zod
const userSchema = z.object({
  username: z.string().min(2, 'Nombre muy corto').max(50, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono muy corto').optional(),
  address: z.string().max(100, 'Dirección muy larga').optional(),
  photo: z.string().url('URL inválida').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserFormProps {
  user: User;
  onSave?: (data: UserFormData) => Promise<void>;
}

export default function EditUserForm({ user, onSave }: EditUserFormProps) {
  const dispatch = useAppDispatch();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await dispatch(updateUserProfile(data));

      setSnackbar({
        open: true,
        message: 'Perfil actualizado correctamente',
        severity: 'success',
      });

      reset(data, { keepValues: true });

      if (onSave) {
        onSave(data);
      }
    } catch (error: unknown) {
      let errorMessage = 'Error al actualizar el perfil';

      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Stack spacing={4}>
        {/* Sección de avatar */}
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar src={user.photo} sx={{ width: 80, height: 80 }} />
          <TextField
            label="Nombre completo"
            {...register('username')}
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            required
          />
        </Stack>

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

        {/*         <TextField
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
        /> */}

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
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
}
