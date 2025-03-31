'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
  const { user, error, isLoading } = useUser();
  if (isLoading) {
    return (
      <Card sx={{ textAlign: 'center', padding: 2 }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ textAlign: 'center', padding: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card sx={{ textAlign: 'center', padding: 2 }}>
        <Typography>No se encontró usuario autenticado</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar
            src={user.avatar || '/assets/avatar.png'}
            alt={user.name}
            sx={{ height: 80, width: 80 }}
          />
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user.name}</Typography>
            {user.jobTitle ? (
              <Typography color="text.secondary" variant="body2">
                {user?.jobTitle}
              </Typography>
            ) : null}
            {user.city && user.country ? (
              <Typography color="text.secondary" variant="body2">
                {`${user?.city}, ${user?.country}`}
              </Typography>
            ) : null}

            {user.timezone ? (
              <Typography color="text.secondary" variant="body2">
                {user?.timezone}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Subir imagen
        </Button>
      </CardActions>
    </Card>
  );
}
