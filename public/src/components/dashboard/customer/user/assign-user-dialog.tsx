import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Plus, Minus } from '@phosphor-icons/react';
import { useAppDispatch, useAppSelector } from '@/store';
import { assignUserToOwner, removeUserFromOwner, fetchOwnerUsers } from '@/store/slices/role/role-thunks';
import { selectOwnerUsers } from '@/store/slices/role/role-selectors';
import type { User } from '@/types/user';

interface AssignUserDialogProps {
  open: boolean;
  onClose: () => void;
  ownerId: string; // Este es el ID del rol del owner
  users: User[];
  isLoading: boolean;
}

export const AssignUserDialog: React.FC<AssignUserDialogProps> = ({ 
  open, 
  onClose, 
  ownerId,
  users,
  isLoading
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownerUsers = useAppSelector(selectOwnerUsers);

  const handleAssignUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(assignUserToOwner({ ownerId, userId })).unwrap();
      // Refrescar la lista de usuarios del owner
      await dispatch(fetchOwnerUsers(ownerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(removeUserFromOwner({ ownerId, userId: userId })).unwrap();
      // Refrescar la lista de usuarios del owner
      await dispatch(fetchOwnerUsers(ownerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover usuario');
    } finally {
      setLoading(false);
    }
  };

  // Usuarios asignados al owner (vienen del servicio)
  const assignedUsers = ownerUsers?.users || [];

  // Usuarios disponibles para asignar (todos los users menos los asignados)
  const availableUsers = users.filter(user => 
    user.role.name === 'member' && 
    !assignedUsers.some(assignedUser => assignedUser._id === user._id)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gestionar Usuarios del Owner</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Usuarios Asignados */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Miembros Asignados ({assignedUsers.length})
            </Typography>
            <List>
              {assignedUsers.map(user => (
                <ListItem key={user._id}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{user.username}</Typography>
                        <Chip 
                          label={user.role.name} 
                          size="small"
                          color="success"
                        />
                      </Box>
                    }
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      onClick={() => handleRemoveUser(user._id)}
                      disabled={loading}
                      color="error"
                    >
                      <Minus size={20} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Usuarios Disponibles */}
            <Typography variant="h6" sx={{ mb: 1 }}>
              Usuarios Disponibles ({availableUsers.length})
            </Typography>
            <List>
              {availableUsers.map(user => (
                <ListItem key={user._id}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{user.username}</Typography>
                        <Chip 
                          label={user.role.name} 
                          size="small"
                          color="success"
                        />
                      </Box>
                    }
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="add"
                      onClick={() => handleAssignUser(user._id)}
                      disabled={loading}
                      color="primary"
                    >
                      <Plus size={20} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}; 