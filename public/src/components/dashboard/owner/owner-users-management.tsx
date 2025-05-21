'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@phosphor-icons/react/dist/ssr';
import { api } from '@/lib/api';

interface Owner {
  _id: string;
  name: string;
  users: User[];
}

interface User {
  _id: string;
  username: string;
  email: string;
}

export default function OwnerUsersManagement(): React.JSX.Element {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleAssignUser = async () => {
    try {
      await api.post(`/roles/owner/${selectedOwner}/users`, {
        userId: selectedUser,
      });
      /* fetchOwners(); */
      setOpenDialog(false);
      setSelectedUser('');
    } catch (error) {
      console.error('Error al asignar usuario:', error);
    }
  };

  const handleRemoveUser = async (ownerId: string, userId: string) => {
    try {
      await api.delete(`/roles/owner/${ownerId}/users/${userId}`);
      /* fetchOwners(); */
    } catch (error) {
      console.error('Error al remover usuario:', error);
    }
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Usuarios de Owners</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Asignar Usuario
        </Button>
      </Stack>

      {owners.map((owner) => (
        <Card key={owner._id} sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {owner.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {owner.users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveUser(owner._id, user._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ))}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Asignar Usuario a Owner</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Owner</InputLabel>
            <Select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              label="Owner"
            >
              {owners.map((owner) => (
                <MenuItem key={owner._id} value={owner._id}>
                  {owner.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Usuario</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Usuario"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAssignUser}
            variant="contained"
            disabled={!selectedOwner || !selectedUser}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
