// UserProfile.tsx
import * as React from 'react';
import { Avatar, Box, Typography, Stack } from '@mui/material';

interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  createdAt: Date;
  isSuspended?: boolean;
  isActive?: boolean;
}

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps): React.JSX.Element {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Avatar src={user.avatar} sx={{ width: 80, height: 80 }} />
        <Stack spacing={0.5}>
          <Typography variant="h5">{user.name}</Typography>
          <Typography color="text.secondary">{user.email}</Typography>
          {user.phone ? <Typography color="text.secondary">{user.phone}</Typography> : null}
          <Typography color="text.secondary" variant="body2">
            Rol: {user.role}
          </Typography>
          {user.address ? (
            <Typography color="text.secondary" variant="body2">
              Dirección: {user.address}
            </Typography>
          ) : null}
          <Typography variant="body2" color="text.secondary">
            Fecha de registro: {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
