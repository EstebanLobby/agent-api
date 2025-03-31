import React, { useState } from 'react';
import { Box, Button, CircularProgress, Modal, TextField, Typography } from '@mui/material';

import { whatsappClient } from '@/lib/whatsappApi/whatsapp-api';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  initialNumber?: string;
}

export function SendMessageModal({ open, onClose, initialNumber = '' }: SendMessageModalProps) {
  const [numero, setNumero] = useState(initialNumber);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!numero.trim() || !mensaje.trim()) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await whatsappClient.sendMessage({
        destino: numero,
        mensaje,
      });

      if (response.success) {
        setMensaje('');
        onClose();
      } else {
        setError(response.error || 'Error desconocido al enviar el mensaje.');
      }
    } catch (err) {
      setError('Error al enviar el mensaje.');
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="send-message-modal">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Enviar Mensaje
        </Typography>
        <TextField
          label="Número de destinatario"
          fullWidth
          margin="normal"
          value={numero}
          onChange={(e) => {
            setNumero(e.target.value);
          }}
        />
        <TextField
          label="Mensaje"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={mensaje}
          onChange={(e) => {
            setMensaje(e.target.value);
          }}
        />
        {error ? (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSend} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Enviar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
