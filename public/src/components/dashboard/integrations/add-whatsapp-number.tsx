'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  CircularProgress,
  TextField,
  Box,
  Typography,
  Modal,
  Alert,
} from '@mui/material';
import { PlugsConnected as ConnectIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { QrCode as QrCodeIcon } from '@phosphor-icons/react/dist/ssr/QrCode';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const user = useAppSelector((state) => state.user.user);

  // Cleanup function para el socket
  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Reset del modal cuando se abre/cierra
  useEffect(() => {
    if (open) {
      // Reset al abrir
      setQrCode(null);
      setError(null);
      setNumero('');
      setIsConnecting(false);
      setSuccessMessage(null);
    } else {
      // Cleanup al cerrar
      cleanupSocket();
      setLoading(false);
      setIsConnecting(false);
    }

    return () => {
      cleanupSocket();
    };
  }, [open]);

  // Función para validar el número
  const validateNumber = (number: string): boolean => {
    // Validación básica: debe empezar con + y tener al menos 10 dígitos
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(number.replace(/\s/g, ''));
  };

  // Función principal para conectar
  const handleConnect = async () => {
    if (!numero.trim()) {
      setError('Por favor ingresa un número de WhatsApp');
      return;
    }

    if (!validateNumber(numero.trim())) {
      setError('Ingresa un número válido con código de país (ej: +5491123456789)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setIsConnecting(true);

    try {
      // Iniciar sesión
      const response = await whatsappClient.startSession(numero.trim());
      
      if (response.error) {
        setError('Error al iniciar sesión. Intenta nuevamente.');
        setLoading(false);
        setIsConnecting(false);
        return;
      }

      // Configurar socket para escuchar eventos
      setupSocket();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
      setLoading(false);
      setIsConnecting(false);
    }
  };

  // Configurar socket
  const setupSocket = () => {
    cleanupSocket(); // Limpiar socket anterior si existe

    console.log('🔌 Configurando socket...');
    
    // URL para Socket.IO según el entorno
    let socketUrl;
    
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      // Desarrollo local
      socketUrl = 'http://localhost:5000';
    } else if (process.env.NEXT_PUBLIC_ENV === 'testing') {
      // Testing
      socketUrl = process.env.NEXT_TESTING_SOCKET_URL || 'http://localhost:5000';
    } else {
      // Producción - sin /api para socket
      socketUrl = 'https://checkia.lobby-digital.com';
    }
    
    console.log('Socket URL:', socketUrl);
    console.log('Environment:', process.env.NEXT_PUBLIC_ENV);
    console.log('All env vars:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV
    });

    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket.id);
      console.log('Socket status:', socket.connected);
      
      // Test de conexión
      socket.emit('test_connection', { message: 'Frontend conectado' });
      
      // Opcional: unirse a room específico
      // socket.emit('join_room', 'user_id_here');
    });

    socket.on('connection_test', (data) => {
      console.log('🧪 Test de conexión recibido:', data);
    });

    socket.on('test_response', (data) => {
      console.log('🧪 Test response recibido:', data);
    });

    socket.on('qr_update', (qrBase64) => {
      console.log('📱 QR recibido! Length:', qrBase64?.length);
      console.log('QR data preview:', qrBase64?.substring(0, 50) + '...');
      
      setQrCode(qrBase64);
      setLoading(false);
      setError(null);
      setSuccessMessage('¡QR generado! Escanea con WhatsApp');
    });

    socket.on('whatsapp_connected', () => {
      console.log('✅ WhatsApp conectado!');
      setQrCode(null);
      setLoading(false);
      setIsConnecting(false);
      setSuccessMessage('¡WhatsApp conectado exitosamente!');
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
      }, 1500);
    });

    socket.on('qr_error', (err: { message?: string }) => {
      console.log('❌ Error QR recibido:', err);
      setError(err.message || 'Error al generar QR');
      setLoading(false);
      setIsConnecting(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado. Razón:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión socket:', error);
      setError('Error de conexión. Verifica tu internet.');
    });

    // Debug: escuchar todos los eventos
    socket.onAny((event, ...args) => {
      console.log('📡 Evento recibido:', event, args);
    });
  };

  const handleClose = () => {
    if (socketRef.current && user?.id) {
      socketRef.current.emit('cancel_qr', { userId: user.id });
    }
    cleanupSocket();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Agregar número de WhatsApp
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresa tu número de WhatsApp para generar el código QR y conectar tu cuenta.
        </Typography>

        {/* Campo de número */}
        <TextField
          fullWidth
          label="Número de WhatsApp"
          value={numero}
          onChange={(e) => {
            setNumero(e.target.value);
            setError(null); // Limpiar error al escribir
          }}
          placeholder="+5491123456789"
          margin="normal"
          disabled={isConnecting}
          helperText="Incluye el código de país completo"
        />

        {/* Botón Conectar */}
        {!isConnecting && !qrCode && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleConnect}
              disabled={!numero.trim() || loading}
              startIcon={<ConnectIcon />}
              size="large"
            >
              Conectar WhatsApp
            </Button>
            
            {/* Botón de test temporal - REMOVER EN PRODUCCIÓN */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                console.log('🧪 Testeando socket...');
                if (socketRef.current) {
                  console.log('Socket existe:', socketRef.current.connected);
                  socketRef.current.emit('test_event', { test: 'data' });
                } else {
                  console.log('No hay socket');
                  setupSocket();
                }
              }}
              sx={{ mt: 1 }}
              size="small"
            >
              🧪 Test Socket (DEV)
            </Button>
          </Box>
        )}

        {/* Estados de carga */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              Generando código QR...
            </Typography>
          </Box>
        )}

        {/* QR Code */}
        {qrCode && (
          <Box sx={{ my: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <QrCodeIcon size={20} />
              <Typography variant="subtitle2" sx={{ ml: 1 }}>
                Escanea este código QR con WhatsApp
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: 2, 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              bgcolor: '#ffffff' // Fondo blanco para mejor contraste
            }}>
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                style={{ 
                  maxWidth: '300px', // Aumentar tamaño
                  width: '100%',
                  height: 'auto',
                  imageRendering: 'crisp-edges' // Mejor calidad
                }}
              />
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
              📱 Abre WhatsApp → ⋮ Menú → Dispositivos vinculados → Vincular un dispositivo
            </Typography>
            
            {/* 🆕 Botones de debug */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  console.log('🔍 QR Base64 completo:', qrCode);
                  console.log('🔍 QR length:', qrCode?.length);
                  console.log('🔍 QR es válido:', qrCode?.startsWith('data:image/'));
                }}
              >
                🔍 Debug QR
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCode;
                  link.download = 'whatsapp-qr.png';
                  link.click();
                }}
              >
                📥 Descargar QR
              </Button>
            </Box>
          </Box>
        )}

        {/* Mensajes de estado */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Botones */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          
          {isConnecting && (
            <Button
              variant="contained"
              onClick={handleConnect}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <ConnectIcon />}
            >
              {loading ? 'Conectando...' : 'Reconectar'}
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
}