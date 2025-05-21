'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Button, 
  Stack, 
  TextField, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Alert, 
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/store';
import { updateUserProfile, updateUserRole } from '@/store/slices/user/user-thunks';
import type { User } from '@/types/user';
import { api } from '@/lib/api';

// Esquema de validación con Zod
const userSchema = z.object({
  username: z.string().min(2, 'Nombre muy corto').max(50, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono muy corto').optional(),
  address: z.string().max(100, 'Dirección muy larga').optional(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  role: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface Role {
  id: string;
  name: string;
}

interface EditUserFormProps {
  user: User;
  isAdmin: boolean;
  onSave?: () => void;
}

export default function EditUserForm({ user, isAdmin, onSave }: EditUserFormProps) {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get<Role[]>('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error al cargar roles:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los roles',
          severity: 'error',
        });
      }
    };

    if (isAdmin) {
      fetchRoles();
    }
  }, [isAdmin]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      role: user.role?.id || '', // Mantenemos el ID como valor
    },
  });

  const currentRole = watch('role');

  const handleRoleChange = async (newRoleId: string) => {
    try {
      // Aseguramos que estamos enviando el ID del rol
      const roleId = newRoleId;
      console.log('Enviando ID del rol al servicio:', roleId);
      
      await dispatch(updateUserRole({ 
        userId: user._id, 
        roleId: roleId 
      })).unwrap();

      setValue('role', roleId, { shouldDirty: true });
      setSnackbar({
        open: true,
        message: 'Rol actualizado correctamente',
        severity: 'success',
      });
    } catch (error: unknown) {
      let errorMessage = 'Error al actualizar el rol';

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

  const onSubmit = async (data: UserFormData) => {
    try {
      // Aseguramos que todos los campos estén incluidos en el payload
      const payload = {
        ...data,
        _id: user._id, // Incluimos el ID del usuario
        role: currentRole, // Usamos el rol actual
      };

      console.log('Enviando payload:', payload);

      await dispatch(updateUserProfile(payload)).unwrap();

      setSnackbar({
        open: true,
        message: 'Usuario actualizado correctamente',
        severity: 'success',
      });

      reset(data, { keepValues: true });

      if (onSave) {
        onSave();
      }
    } catch (error: unknown) {
      let errorMessage = 'Error al actualizar el usuario';

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <TextField
          label="Nombre de usuario"
          {...register('username')}
          error={!!errors.username}
          helperText={errors.username?.message}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />

        <TextField
          label="Teléfono"
          {...register('phone')}
          error={!!errors.phone}
          helperText={errors.phone?.message}
          fullWidth
        />

        <TextField
          label="Dirección"
          {...register('address')}
          error={!!errors.address}
          helperText={errors.address?.message}
          fullWidth
          multiline
          rows={3}
        />

        {isAdmin && (
          <Stack spacing={2}>
            <Typography variant="h6">Opciones de administrador</Typography>

            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={currentRole || ''}
                label="Rol"
                onChange={(e) => handleRoleChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Seleccionar rol</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch {...register('isActive')} />}
              label="Usuario activo"
            />

            <FormControlLabel
              control={<Switch {...register('isSuspended')} />}
              label="Usuario suspendido"
            />
          </Stack>
        )}

        {isDirty && <Alert severity="info">Tienes cambios sin guardar</Alert>}

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
    </form>
  );
}
