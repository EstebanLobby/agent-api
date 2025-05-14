'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

  useEffect(() => {
    if (!open) {
      setQrCode(null);
      setError(null);
      return undefined;
    }

    setLoading(true);

    whatsappClient
      .startSession()
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
  }, [open, onClose]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Añadir Nueva Integración</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
      >
        <p>Escanea este código QR para vincular WhatsApp:</p>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : qrCode ? (
          <img src={qrCode} alt="Código QR para WhatsApp" style={{ width: 400, height: 400 }} />
        ) : (
          <p>Esperando QR...</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
