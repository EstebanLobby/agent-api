import React, { useState } from 'react';
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

import { whatsappClient } from '@/lib/whatsappApi/whatsapp-api';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  initialNumber?: string;
}

// Lista de países con sus códigos
const countries = [
  { code: '549', name: 'Argentina' },
  { code: '55', name: 'Brasil' },
  { code: '56', name: 'Chile' },
  { code: '57', name: 'Colombia' },
  { code: '58', name: 'Venezuela' },
  { code: '51', name: 'Perú' },
  { code: '52', name: 'México' },
  { code: '1', name: 'Estados Unidos/Canadá' },
  // Agrega más países según sea necesario
];

export function SendMessageModal({ open, onClose, initialNumber = '' }: SendMessageModalProps) {
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('549'); // Argentina por defecto
  const [rawNumber, setRawNumber] = useState('');

  const handleSend = async () => {
    // Construye el número completo con código de país
    const fullNumber = `${selectedCountry}${rawNumber.replace(/\D/g, '')}`;

    if (!rawNumber.trim() || !mensaje.trim()) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await whatsappClient.sendMessage({
        destino: fullNumber,
        mensaje,
      });

      if (response.success) {
        setMensaje('');
        setRawNumber('');
        onClose();
      } else {
        setError(response.error || 'Error desconocido al enviar el mensaje.');
      }
    } catch (err) {
      setError('Error al enviar el mensaje.');
    }

    setLoading(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Elimina cualquier carácter que no sea dígito
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setRawNumber(digitsOnly);
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

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="country-select-label">País</InputLabel>
            <Select
              labelId="country-select-label"
              value={selectedCountry}
              label="País"
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name} (+{country.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Número"
            fullWidth
            value={rawNumber}
            onChange={handleNumberChange}
            placeholder="Ej: 1122334455"
          />
        </Box>

        <Typography variant="body2" sx={{ mb: 1 }}>
          Número completo: +{selectedCountry}
          {rawNumber}
        </Typography>

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
