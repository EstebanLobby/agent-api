'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, TextField, Link, Alert, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store';
import { signIn } from '@/store/slices/auth/auth-thunks';

// Esquema de validación extendido
const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder los 50 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function SignInForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const user = useAppSelector((state) => state.user.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Validar mientras se escribe
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const resultAction = await dispatch(signIn(values));

      if (signIn.fulfilled.match(resultAction)) {
        reset(); // Limpiar formulario
        
        // Redirigir según el rol del usuario
        switch (user?.role.name) {
          case 'member':
            router.push('/dashboard/integrations');
            break;
          case 'owner':
            router.push('/dashboard/users');
            break;
          case 'admin':
            router.push('/dashboard/customers');
            break;
          default:
            router.push('/dashboard/integrations');
        }
      }
    } catch (err) {
      // El error ya está manejado por el thunk y se muestra desde el estado
      console.error('Login error:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {typeof error === 'string' ? error : 'Error al iniciar sesión'}
        </Alert>
      ) : null}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo electrónico"
        autoComplete="email"
        autoFocus
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, height: 48 }}
        disabled={isLoading || isSubmitting || !isValid}
      >
        {isLoading ? <CircularProgress size={24} color="primary" /> : 'Iniciar sesión'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Link href="/auth/reset-password" variant="body2" underline="hover">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/auth/sign-up" variant="body2" underline="hover">
          ¿No tienes cuenta? Regístrate
        </Link>
      </Box>
    </Box>
  );
}
