'use client';

import React, { useEffect, useState } from 'react';
import { Button, IconButton, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowClockwise as ReloadIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';



import { whatsappClient } from '@/lib/whatsappApi/whatsappApi';



import { AddWhatsAppNumber } from './add-whatsapp-number';
import { SendMessageModal } from './send-message-modal';


const statusMap = {
  pending: { label: 'pending', color: 'warning' },
  connected: { label: 'connected', color: 'success' },
  disconnected: { label: 'disconnected', color: 'error' },
} as const;

export interface Order {
  _id: string;
  createdAt: string;
  numero: string;
  status: 'pending' | 'connected' | 'disconnected';
}

export function BoardIntegrations({ sx }: { sx?: any }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [integrations, setIntegrations] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Order | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await whatsappClient.getSessions();
      const sessions = response.sessions || [];
      console.log(sessions);

      const updatedSessions = sessions.map((session: any) => ({
        _id: session._id,
        createdAt: session.createdAt,
        numero: session.numero,
        status: session.status,
      }));
      setIntegrations(updatedSessions);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
    setLoading(false);
  };

  const hanldeClosed = () => {
    setOpen(false);
    fetchIntegrations();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, integration: Order) => {
    setMenuAnchor(event.currentTarget);
    setSelectedIntegration(integration);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedIntegration(null);
  };

  const handleDisconnect = () => {
    if (selectedIntegration) {
      console.log(`Desconectando ${selectedIntegration.numero}`);
      // Aquí podrías llamar a una función para desconectar el número.
    }
    handleMenuClose();
  };

  const handleOpenMessageModal = () => {
    setMessageModalOpen(true);
    handleMenuClose();
  };

  return (
    <Card sx={sx}>
      <CardHeader
        title="Integraciones Whatsapp"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
              onClick={() => {
                setOpen(true);
              }}
            >
              Add
            </Button>
            <Button
              startIcon={<ReloadIcon size={24} weight="bold" />}
              variant="contained"
              onClick={fetchIntegrations}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Recargar'}
            </Button>
          </Box>
        }
      />
      <Divider />

      <AddWhatsAppNumber
        open={open}
        onClose={() => {
          hanldeClosed();
        }}
      />

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Numero</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {integrations.map((value) => {
              const { label, color } = statusMap[value.status] ?? { label: 'Unknown', color: 'default' };
              return (
                <TableRow hover key={value._id}>
                  <TableCell>{value.createdAt}</TableCell>
                  <TableCell>{value.numero}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', width: '50px' }}>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        handleMenuOpen(e, value);
                      }}
                    >
                      <DotsThreeVerticalIcon weight="bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      {/* Menú desplegable */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDisconnect}>Desconectar</MenuItem>
        <MenuItem onClick={handleOpenMessageModal}>Enviar Mensaje</MenuItem>
      </Menu>

      <SendMessageModal
        open={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
        }}
        initialNumber={selectedIntegration?.numero}
      />
    </Card>
  );
}