import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useUser } from '@/hooks/use-user';
import { whatsappClient } from '@/lib/whatsappApi/whatsapp-api';
import type { WhatsAppSession } from '@/types/whatsapp';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  initialNumber?: string;
}

function SendMessageModal({ open, onClose, initialNumber }: SendMessageModalProps) {
  const [number, setNumber] = useState(initialNumber || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const { user } = useUser();
  const isOwner = user?.role === 'owner';

  const loadSessions = async () => {
    try {
      const { sessions: activeSessions } = await whatsappClient.getSessions();
      if (activeSessions) {
        setSessions(activeSessions);
      }
    } catch (err) {
      console.error('Error cargando sesiones:', err);
    }
  };

  useEffect(() => {
    if (open && isOwner) {
      loadSessions();
    }
  }, [open, isOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await whatsappClient.sendMessage({
        destino: number,
        mensaje: message,
        sessionId: isOwner ? selectedSession : undefined,
      });

      if (result.error) {
        setErrorMessage(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMessage('Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Enviar Mensaje de WhatsApp
        </Typography>

        <form onSubmit={handleSubmit}>
          {isOwner ? (
            <FormControl fullWidth margin="normal">
              <InputLabel>Sesión de WhatsApp</InputLabel>
              <Select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                label="Sesión de WhatsApp"
                required
              >
                {sessions.map((session) => (
                  <MenuItem key={session._id} value={session._id}>
                    {session.numero} ({session.status})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <TextField
            fullWidth
            label="Número de teléfono"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            margin="normal"
            required
            placeholder="+5491123456789"
          />

          <TextField
            fullWidth
            label="Mensaje"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            required
            multiline
            rows={4}
          />

          {errorMessage ? (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          ) : null}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Enviar
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}

export { SendMessageModal };
