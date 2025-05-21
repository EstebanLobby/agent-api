'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  Stack,
} from '@mui/material';

import {
  Trash as TrashIcon,
  Prohibit as ProhibitIcon,
  User as UserIcon,
  CheckCircle as CheckCircleIcon,
} from '@phosphor-icons/react/dist/ssr';

import { useAppDispatch } from '@/store';
import { suspendUser, deleteUser, fetchAllUsers } from '@/store/slices/user/user-thunks';

// Constantes
const ROLE_LABELS = {
  admin: 'Admin',
  owner: 'Owner',
  member: 'Member',
} as const;

const ROLE_COLORS = {
  admin: 'error',
  owner: 'warning',
  member: 'success',
} as const;

interface Member {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  isSuspended?: boolean;
}

interface MembersTableProps {
  members: Member[];
}

export function MembersTable({ members }: MembersTableProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [dialogState, setDialogState] = React.useState({
    open: false,
    title: '',
    message: '',
    action: () => {},
  });

  const openConfirmDialog = (title: string, message: string, action: () => void) => {
    setDialogState({
      open: true,
      title,
      message,
      action,
    });
  };

  const closeDialog = () => {
    setDialogState({
      ...dialogState,
      open: false,
    });
  };

  const handleConfirm = () => {
    dialogState.action();
    closeDialog();
  };

  const handleSuspendUser = async (userId: string, isSuspended: boolean) => {
    try {
      await dispatch(suspendUser({ 
        userId, 
        action: isSuspended ? 'activate' : 'suspend',
        reason: isSuspended ? undefined : 'Suspensión administrativa'
      })).unwrap();
      dispatch(fetchAllUsers());
    } catch (error) {
      console.error('Error al suspender/activar usuario:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      dispatch(fetchAllUsers());
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  return (
    <Card>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Miembros Relacionados ({members.length})
        </Typography>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={ROLE_LABELS[member.role.name as keyof typeof ROLE_LABELS] || member.role.name}
                    color={ROLE_COLORS[member.role.name as keyof typeof ROLE_COLORS] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={member.isSuspended ? 'Suspendido' : 'Activo'}
                    color={member.isSuspended ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Ver Miembro">
                      <IconButton onClick={() => router.push(`/dashboard/customers/${member.id}`)}>
                        <UserIcon size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={member.isSuspended ? "Activar Miembro" : "Suspender Miembro"}>
                      <IconButton
                        color={member.isSuspended ? "success" : "warning"}
                        onClick={() =>
                          openConfirmDialog(
                            member.isSuspended ? 'Activar miembro' : 'Suspender miembro',
                            `¿Estás seguro de que deseas ${member.isSuspended ? 'activar' : 'suspender'} a ${member.name}?`,
                            () => handleSuspendUser(member.id, member.isSuspended || false),
                          )
                        }
                      >
                        {member.isSuspended ? <CheckCircleIcon size={20} /> : <ProhibitIcon size={20} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Miembro">
                      <IconButton
                        color="error"
                        onClick={() =>
                          openConfirmDialog(
                            'Eliminar miembro',
                            `¿Estás seguro de que deseas eliminar a ${member.name}?`,
                            () => handleDeleteUser(member.id),
                          )
                        }
                      >
                        <TrashIcon size={20} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={dialogState.open} onClose={closeDialog} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogState.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={handleConfirm} color="error" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
} 