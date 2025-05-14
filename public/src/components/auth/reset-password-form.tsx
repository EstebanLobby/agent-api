'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/auth-client';

// Esquema para solicitar reset (solo email)
const requestResetSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'El correo es requerido' })
    .email('Correo electrónico inválido'),
  password: zod.string().optional(),
  confirmPassword: zod.string().optional(),
});

// Esquema para actualizar contraseña (con token)
const updatePasswordSchema = zod
  .object({
    email: zod.string().optional(),
    password: zod.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: zod.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type Values = zod.infer<typeof requestResetSchema>;

const defaultValues = {
  email: '',
  password: '',
  confirmPassword: '',
} satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(token ? updatePasswordSchema : requestResetSchema),
    mode: 'onChange',
  });

  // Observar el valor del email
  const email = watch('email');
  console.log('Email actual:', email, 'isValid:', isValid, 'isDirty:', isDirty, 'token:', token);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      console.log('Iniciando envío de formulario:', values);
      setIsPending(true);
      setErrorMessage(null);

      try {
        if (token) {
          console.log('Procesando actualización de contraseña con token:', token);
          const { error } = await authClient.resetPassword({
            token,
            newPassword: values.password!,
          });

          if (error) {
            console.error('Error al actualizar contraseña:', error);
            setError('root', { type: 'server', message: error });
            return;
          }

          setIsSuccess(true);
          setTimeout(() => {
            router.push('/auth/sign-in');
          }, 2000);
        } else {
          console.log('Solicitando reset de contraseña para email:', values.email);
          const { error, data } = await authClient.resetPassword({
            email: values.email,
          });

          if (error) {
            console.error('Error al solicitar reset:', error);
            setError('root', { type: 'server', message: error });
            return;
          }

          console.log('Respuesta del servidor:', data);
          setIsSuccess(true);
        }
      } catch (error: any) {
        console.error('Error inesperado:', error);
        setErrorMessage(error.message || 'Error inesperado al procesar la solicitud');
        setError('root', { type: 'server', message: error.message });
      } finally {
        setIsPending(false);
      }
    },
    [router, setError, token],
  );

  return (
    <Stack spacing={4}>
      <Typography variant="h5">
        {token ? 'Restablecer contraseña' : 'Solicitar restablecimiento de contraseña'}
      </Typography>
      <form
        onSubmit={(e) => {
          console.log('Form submit event triggered');
          handleSubmit(onSubmit)(e);
        }}
      >
        <Stack spacing={2}>
          {!token && (
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)}>
                  <InputLabel>Correo electrónico</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="Correo electrónico"
                    type="email"
                    onChange={(e) => {
                      console.log('Email input changed:', e.target.value);
                      field.onChange(e);
                    }}
                  />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
          )}

          {token ? (
            <>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.password)}>
                    <InputLabel>Nueva contraseña</InputLabel>
                    <OutlinedInput {...field} label="Nueva contraseña" type="password" />
                    {errors.password ? (
                      <FormHelperText>{errors.password.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.confirmPassword)}>
                    <InputLabel>Confirmar contraseña</InputLabel>
                    <OutlinedInput {...field} label="Confirmar contraseña" type="password" />
                    {errors.confirmPassword ? (
                      <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
            </>
          ) : null}

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {errorMessage ? <Alert color="error">{errorMessage}</Alert> : null}
          {isSuccess ? (
            <Alert color="success">
              {token
                ? 'Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...'
                : 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'}
            </Alert>
          ) : null}
          <Button
            disabled={isPending || (!token && (!email || Boolean(errors.email)))}
            type="submit"
            variant="contained"
            onClick={() =>
              console.log('Button clicked, email:', email, 'errors:', errors, 'isValid:', isValid)
            }
          >
            {token ? 'Actualizar contraseña' : 'Enviar enlace de recuperación'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
