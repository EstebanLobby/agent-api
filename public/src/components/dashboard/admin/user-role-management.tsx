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
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ChatCircleText } from '@phosphor-icons/react';
import { useAppDispatch } from '@/store';
import { enviarMensajeWhatsApp } from '@/store/slices/role/role-thunks';
import { api } from '@/lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OwnerUsersResponse {
  users: User[];
  total: number;
}

interface MensajeDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (numero: string, mensaje: string) => Promise<void>;
  loading: boolean;
}

const MensajeDialog: React.FC<MensajeDialogProps> = ({ open, onClose, onSend, loading }) => {
  const [numero, setNumero] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!numero || !mensaje) {
      setError('Por favor completa todos los campos');
      return;
    }
    try {
      await onSend(numero, mensaje);
      setNumero('');
      setMensaje('');
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enviar Mensaje de WhatsApp</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Número de WhatsApp"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Ej: 5491234567890"
            fullWidth
            required
          />
          <TextField
            label="Mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleSend} 
          variant="contained" 
          disabled={loading || !numero || !mensaje}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function UserRoleManagement(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeDialog, setMensajeDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({
    open: false,
    userId: null
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchOwnerUsers();
  }, []);

  const fetchOwnerUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<OwnerUsersResponse>('/roles/owner/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error al obtener usuarios del owner:', error);
      setError('Error al cargar los usuarios asignados');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (numero: string, mensaje: string) => {
    if (!mensajeDialog.userId) return;
    
    setSendingMessage(true);
    try {
      await dispatch(enviarMensajeWhatsApp({
        userId: mensajeDialog.userId,
        numero,
        mensaje
      })).unwrap();
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mis Usuarios Asignados</Typography>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Card sx={{ p: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Fecha de Asignación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No tienes usuarios asignados
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role.name}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Enviar mensaje de WhatsApp">
                        <IconButton
                          color="primary"
                          onClick={() => setMensajeDialog({ open: true, userId: user._id })}
                        >
                          <ChatCircleText size={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <MensajeDialog
        open={mensajeDialog.open}
        onClose={() => setMensajeDialog({ open: false, userId: null })}
        onSend={handleSendMessage}
        loading={sendingMessage}
      />
    </Box>
  );
}
