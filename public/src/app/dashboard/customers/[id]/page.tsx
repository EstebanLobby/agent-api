'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Typography, Card, Button, Stack, Divider, Box, Grid, Chip, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAllUsers } from '@/store/slices/user/user-thunks';
import { fetchOwnerUsers } from '@/store/slices/role/role-thunks';
import { selectAllUsers, selectAllUsersLoading } from '@/store/slices/user/user-selectors';
import { selectOwnerUsers, selectRoleLoading, selectRoleError } from '@/store/slices/role/role-selectors';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MembersTable } from '@/components/dashboard/customer/user/members-table';
import { AssignUserDialog } from '@/components/dashboard/customer/user/assign-user-dialog';
import { UserPlus } from '@phosphor-icons/react';

export default function UserPage(): React.JSX.Element {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  const dispatch = useAppDispatch();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  const users = useAppSelector(selectAllUsers);
  const isLoading = useAppSelector(selectAllUsersLoading);
  const ownerUsers = useAppSelector(selectOwnerUsers);
  const roleLoading = useAppSelector(selectRoleLoading);
  const roleError = useAppSelector(selectRoleError);

  useEffect(() => {
    if (id) {
      dispatch(fetchAllUsers());
      dispatch(fetchOwnerUsers(id));
    }
  }, [dispatch, id]);

  const user = users.find((u) => u._id === id);

  if (isLoading || roleLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (roleError) {
    return (
      <Box p={3}>
        <Alert severity="error">{roleError}</Alert>
      </Box>
    );
  }

  if (!user) return <Typography>Usuario no encontrado</Typography>;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Perfil de Usuario</Typography>
        {user.role.name === 'owner' && (
          <Button
            variant="contained"
            startIcon={<UserPlus size={20} />}
            onClick={() => setIsAssignDialogOpen(true)}
          >
            Gestionar Usuarios
          </Button>
        )}
      </Stack>

      <Card sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre de Usuario
                </Typography>
                <Typography variant="body1">{user.username}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Teléfono
                </Typography>
                <Typography variant="body1">{user.phone || 'No especificado'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dirección
                </Typography>
                <Typography variant="body1">{user.address || 'No especificada'}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Estado y Roles */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Estado y Roles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Rol
                </Typography>
                <Chip 
                  label={user.role.name} 
                  color={user.role.name === 'admin' ? 'primary' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado
                </Typography>
                <Chip 
                  label={user.isSuspended ? 'Suspendido' : 'Activo'} 
                  color={user.isSuspended ? 'error' : 'success'}
                  size="small"
                />
              </Grid>
              {user.isSuspended && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Razón de Suspensión
                  </Typography>
                  <Typography variant="body1">{user.suspendedReason}</Typography>
                  {user.suspendedUntil && (
                    <Typography variant="body2" color="text.secondary">
                      Hasta: {format(new Date(user.suspendedUntil), 'PPP', { locale: es })}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Integraciones */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Integraciones
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(user.integrations).map(([platform, isEnabled]) => (
                <Grid item xs={6} md={3} key={platform}>
                  <Chip 
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)} 
                    color={isEnabled ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Información de Cuenta */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Información de Cuenta
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Creación
                </Typography>
                <Typography variant="body1">
                  {format(new Date(user.createdAt), 'PPP', { locale: es })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Última Actualización
                </Typography>
                <Typography variant="body1">
                  {format(new Date(user.updatedAt), 'PPP', { locale: es })}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* Tabla de Miembros Relacionados */}
      {user.role.name === 'owner' && ownerUsers?.users && ownerUsers.users.length > 0 && (
        <MembersTable members={ownerUsers.users} />
      )}

      {/* Diálogo para gestionar usuarios */}
      <AssignUserDialog
        open={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        ownerId={id}
        users={users}
        isLoading={isLoading}
      />
    </Stack>
  );
}
