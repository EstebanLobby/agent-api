'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/auth-client';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'El nombre es requerido' }),
  lastName: zod.string().min(1, { message: 'El apellido es requerido' }),
  email: zod
    .string()
    .min(1, { message: 'El correo es requerido' })
    .email('Correo electrónico inválido'),
  password: zod.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  terms: zod.boolean().refine((value) => value, 'Debes aceptar los términos y condiciones'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  terms: false,
} satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      try {
        const result = await authClient.signUp(values);
        if (result.data) {
          // Registro y login exitosos
          router.push('/dashboard/integrations');
        } else if (result.error) {
          setError('root', { type: 'server', message: result.error });
        }
      } catch (error: any) {
        setError('root', { type: 'server', message: error.message });
      } finally {
        setIsPending(false);
      }
    },
    [router, setError],
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Registro</Typography>
        <Typography color="text.secondary" variant="body2">
          ¿Ya tienes una cuenta?{' '}
          <Link
            component={RouterLink}
            href={paths.auth.signIn}
            underline="hover"
            variant="subtitle2"
          >
            Iniciar sesión
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.firstName)}>
                <InputLabel>Nombre</InputLabel>
                <OutlinedInput {...field} label="Nombre" />
                {errors.firstName ? (
                  <FormHelperText>{errors.firstName.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.lastName)}>
                <InputLabel>Apellido</InputLabel>
                <OutlinedInput {...field} label="Apellido" />
                {errors.lastName ? (
                  <FormHelperText>{errors.lastName.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Correo electrónico</InputLabel>
                <OutlinedInput {...field} label="Correo electrónico" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Contraseña</InputLabel>
                <OutlinedInput {...field} label="Contraseña" type="password" />
                {errors.password ? (
                  <FormHelperText>{errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label="He leído y acepto los términos y condiciones"
                />
                {errors.terms ? (
                  <FormHelperText error>{errors.terms.message}</FormHelperText>
                ) : null}
              </div>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Registrarse
          </Button>
        </Stack>
      </form>
      <Alert color="warning">Created users are not persisted</Alert>
    </Stack>
  );
}
