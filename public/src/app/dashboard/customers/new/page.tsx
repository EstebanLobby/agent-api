'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useAppDispatch } from '@/store';
import { api } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Esquema de validación
const userSchema = z.object({
  username: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.string().min(1, 'El rol es requerido'),
});

type UserFormData = z.infer<typeof userSchema>;

// Constantes de roles
const ROLES = {
  ADMIN: {
    id: '00000001a3bcc48331b0bf15',
    name: 'admin'
  },
  OWNER: {
    id: '682b7e77b43ded5380102510',
    name: 'owner'
  },
  MEMBER: {
    id: '00000003a3bcc48331b0bf1d',
    name: 'member'
  },
} as const;

const ROLE_LABELS = {
  [ROLES.ADMIN.name]: 'Admin',
  [ROLES.OWNER.name]: 'Owner',
  [ROLES.MEMBER.name]: 'Member',
} as const;

export default function NewUserPage(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: ROLES.MEMBER.id, // Por defecto, asignar rol de member
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post('/user', data);
      
      if (response.data) {
        router.push('/dashboard/customers');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardHeader title="Crear Nuevo Usuario" />
          <Divider />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

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
                  label="Contraseña"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
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
                />

                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    {...register('role')}
                    label="Rol"
                  >
                    {Object.values(ROLES).map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {ROLE_LABELS[role.name]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/dashboard/customers')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </ProtectedRoute>
  );
} 