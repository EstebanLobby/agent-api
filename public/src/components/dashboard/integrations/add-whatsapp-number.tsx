'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
  Modal,
} from '@mui/material';
import { io } from 'socket.io-client';

import { whatsappClient } from '@/lib/whatsappApi/whatsapp-api';

interface AddWhatsAppNumberProps {
  open: boolean;
  onClose: () => void;
}

export function AddWhatsAppNumber({ open, onClose }: AddWhatsAppNumberProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numero, setNumero] = useState('');

  useEffect(() => {
    if (!open) {
      setQrCode(null);
      setError(null);
      setNumero('');
      return undefined;
    }

    if (!numero) {
      setError('Por favor ingresa un número de WhatsApp');
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    whatsappClient
      .startSession(numero)
      .then((response) => {
        if (response.error) {
          setError('Error al iniciar sesión. Intenta nuevamente.');
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error: ${message}`);
        setLoading(false);
      });

    const socket = io(
      process.env.NEXT_PUBLIC_ENV === 'testing'
        ? process.env.NEXT_TESTING_API_URL
        : process.env.NEXT_PUBLIC_API_URL,
      {
        path: '/socket.io',
        transports: ['polling', 'websocket'],
      },
    );

    socket.on('connect', () => {});

    socket.on('qr_update', (qrBase64) => {
      setQrCode(qrBase64);
      setLoading(false);
      setError(null);
    });

    socket.on('whatsapp_connected', () => {
      setQrCode(null);
      setLoading(false);
      onClose();
    });

    socket.on('qr_error', (err: { message?: string }) => {
      setError(err.message || 'Error al generar QR');
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [open, onClose, numero]);

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
          Agregar número de WhatsApp
        </Typography>

        <TextField
          fullWidth
          label="Número de WhatsApp"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="+5491123456789"
          margin="normal"
          error={!!error}
          helperText={error}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {qrCode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%' }} />
          </Box>
        ) : null}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancelar</Button>
        </Box>
      </Box>
    </Modal>
  );
}
