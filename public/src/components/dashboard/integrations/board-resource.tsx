'use client';

import React, { useState } from 'react';
import { Button, TextField, Typography, Stack, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import Divider from '@mui/material/Divider';

import { Paperclip as AttachmentIcon } from '@phosphor-icons/react/dist/ssr/Paperclip';

import { AddWhatsAppNumber } from './add-whatsapp-number';

export interface Order {
  _id: string;
  createdAt: string;
  numero: string;
  status: 'pending' | 'connected' | 'disconnected';
}

export function BoardResource({ sx }: { sx?: any }): React.JSX.Element {
  const [open, setOpen] = useState(false);

  // Estados para la nueva sección
  const [webLink, setWebLink] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const hanldeClosed = () => {
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmitResources = () => {
    // Aquí puedes manejar el envío de los recursos (enlace, texto y archivo)
    console.log({
      webLink,
      customText,
      file: selectedFile,
    });

    // Limpiar los campos después del envío
    setWebLink('');
    setCustomText('');
    setSelectedFile(null);
    setFileName('');
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Informacion del hotel" />
      <Divider />

      <AddWhatsAppNumber
        open={open}
        onClose={() => {
          hanldeClosed();
        }}
      />

      {/* Nueva sección para enlaces, texto y archivos */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Enlace de página web"
            variant="outlined"
            value={webLink}
            onChange={(e) => setWebLink(e.target.value)}
            placeholder="https://ejemplo.com"
          />

          <TextField
            fullWidth
            label="Texto personalizado"
            variant="outlined"
            multiline
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Escribe aquí tu texto..."
          />

          <Box>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Tooltip title="PDF - DOC - TXT">
                <Button variant="outlined" component="span" startIcon={<AttachmentIcon />}>
                  Seleccionar archivo
                </Button>
              </Tooltip>
            </label>
            {fileName ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Archivo seleccionado: {fileName}
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmitResources}
              disabled={!webLink && !customText && !selectedFile}
            >
              Guardar Recursos
            </Button>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}
