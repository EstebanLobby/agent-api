'use client';

import React, { useState } from 'react';
import { Box, Button, CircularProgress, Modal, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  textAlign: 'center',
};

export function WhatsAppModal(): React.JSX.Element {
  const [numero, setNumero] = useState('');
  const [connectedNumbers, setConnectedNumbers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [qrs, setQrs] = useState<Record<string, string>>({});

  const obtenerQR = async (num: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/whatsapp/qr/${num}`);
      const data = await res.json();
      if (data.qr) {
        setQrs((prev) => ({ ...prev, [num]: data.qr }));
      }
    } catch (error) {
      console.error('Error obteniendo QR:', error);
    }
  };

  const verificarEstado = async (num: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/whatsapp/status/${num}`);
      const data = await res.json();
      setConnectedNumbers((prev) => ({ ...prev, [num]: data.connected }));

      if (!data.connected) {
        obtenerQR(num);
      }
    } catch {
      setConnectedNumbers((prev) => ({ ...prev, [num]: false }));
    }
  };

  const iniciarSesion = async () => {
    setLoading(true);
    await fetch('http://localhost:3001/api/whatsapp/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero }),
    });
    verificarEstado(numero);
    setLoading(false);
  };

  return (
    <Modal open={true}>
      <Box sx={modalStyle}>
        <Typography variant="h5">Conectar múltiples WhatsApp 📱</Typography>

        <TextField
          fullWidth
          label="Número de WhatsApp"
          variant="outlined"
          margin="normal"
          value={numero}
          onChange={(e) => {
            setNumero(e.target.value);
          }}
        />
        <Button fullWidth variant="contained" color="primary" onClick={iniciarSesion} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
        </Button>

        <Box mt={2}>
          {Object.keys(connectedNumbers).map((num) => (
            <Box key={num} mt={2}>
              <Typography variant="body1">
                {connectedNumbers[num] ? `✅ Conectado: ${num}` : `⏳ Conectando: ${num}`}
              </Typography>
              {!connectedNumbers[num] && qrs[num] && <img src={qrs[num]} alt="QR" style={{ maxWidth: '100%' }} />}
            </Box>
          ))}
        </Box>

        <Button variant="outlined" sx={{ mt: 2 }}>
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
}

export default WhatsAppModal;
