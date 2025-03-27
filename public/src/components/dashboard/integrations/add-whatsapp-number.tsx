'use client';

import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { io } from 'socket.io-client';



import { whatsappClient } from '@/lib/whatsappApi/whatsappApi';





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
      return;
    }

    setLoading(true);

    // 🔹 Llamar a `/whatsapp/start` automáticamente al abrir el modal
    whatsappClient
      .startSession()
      .then((response) => {
        if (response.error) {
          console.error('❌ Error al iniciar sesión:', response.error);
          setError('Error al iniciar sesión. Intenta nuevamente.');
          setLoading(false);
        } else {
          console.log('✅ Sesión iniciada correctamente.');
        }
      })
      .catch((err) => {
        console.error('❌ Error en la petición a /whatsapp/start:', err);
        setError('Error iniciando sesión.');
        setLoading(false);
      });

    // 🔹 Conectar al WebSocket
    const socket = io('http://127.0.0.1:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🔗 Conectado a WebSocket.');
    });

    socket.on('qr_update', (qrBase64) => {
      console.log('📡 QR recibido:', qrBase64);
      setQrCode(qrBase64);
      setLoading(false);
      setError(null);
    });

    socket.on('whatsapp_connected', () => {
      console.log('✅ Cliente de WhatsApp conectado. Cerrando modal...');
      setQrCode(null);
      setLoading(false);
      onClose(); // 🔹 Cierra el modal automáticamente
    });

    socket.on('qr_error', (err) => {
      console.error('❌ Error al recibir QR:', err);
      setError('Error al generar QR. Intenta nuevamente.');
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [open, onClose]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Añadir Nueva Integración</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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