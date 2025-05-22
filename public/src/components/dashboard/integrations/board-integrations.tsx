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
import { PlugsConnected as ConnectIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { Prohibit as DisconnectIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { PaperPlaneRight as MessageIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneRight';
import { whatsappClient } from '@/lib/whatsappApi/whatsapp-api';
import { AddWhatsAppNumber } from './add-whatsapp-number';
import { SendMessageModal } from './send-message-modal';
import { logger } from '@/lib/default-logger';

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
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Order | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await whatsappClient.getSessions();
      const sessions = response.sessions || [];

      const updatedSessions = sessions.map((session: any) => ({
        _id: session._id,
        createdAt: session.createdAt,
        numero: session.numero,
        status: session.status,
      }));
      setIntegrations(updatedSessions);
    } catch (error) {
      logger.error('Error fetching integrations:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

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

  const handleConnect = async () => {
    if (selectedIntegration) {
      setConnectingId(selectedIntegration._id);
      try {
        // Llamada a la API para conectar la sesión
        await whatsappClient.connectSession(selectedIntegration._id);
        logger.info(`Connecting session: ${selectedIntegration.numero}`);
        
        // Actualizar el estado local inmediatamente (optimistic update)
        setIntegrations(prev => 
          prev.map(integration => 
            integration._id === selectedIntegration._id 
              ? { ...integration, status: 'pending' as const }
              : integration
          )
        );
        
        // Recargar después de un momento para obtener el estado real
        setTimeout(() => {
          fetchIntegrations();
        }, 2000);
        
      } catch (error) {
        logger.error('Error connecting session:', error);
      } finally {
        setConnectingId(null);
      }
    }
    handleMenuClose();
  };

  const handleDisconnect = async () => {
    if (selectedIntegration) {
      try {
        // Llamada a la API para desconectar la sesión
        await whatsappClient.disconnectSession(selectedIntegration._id);
        logger.info(`Disconnecting session: ${selectedIntegration.numero}`);
        
        // Actualizar el estado local inmediatamente
        setIntegrations(prev => 
          prev.map(integration => 
            integration._id === selectedIntegration._id 
              ? { ...integration, status: 'disconnected' as const }
              : integration
          )
        );
        
      } catch (error) {
        logger.error('Error disconnecting session:', error);
      }
    }
    handleMenuClose();
  };

  const handleOpenMessageModal = () => {
    // Solo permitir enviar mensajes si la sesión está conectada
    if (selectedIntegration?.status === 'connected') {
      setMessageModalOpen(true);
    }
    handleMenuClose();
  };

  const renderMenuItems = () => {
    if (!selectedIntegration) return null;

    const { status } = selectedIntegration;
    const isConnecting = connectingId === selectedIntegration._id;

    switch (status) {
      case 'disconnected':
        return (
          <MenuItem onClick={handleConnect} disabled={isConnecting}>
            <ConnectIcon style={{ marginRight: 8 }} />
            {isConnecting ? 'Conectando...' : 'Conectar'}
          </MenuItem>
        );
      
      case 'connected':
        return [
          <MenuItem key="message" onClick={handleOpenMessageModal}>
            <MessageIcon style={{ marginRight: 8 }} />
            Enviar Mensaje
          </MenuItem>,
          <MenuItem key="disconnect" onClick={handleDisconnect}>
            <DisconnectIcon style={{ marginRight: 8 }} />
            Desconectar
          </MenuItem>
        ];
      
      case 'pending':
        return [
          <MenuItem key="message" onClick={handleOpenMessageModal} disabled>
            <MessageIcon style={{ marginRight: 8, opacity: 0.5 }} />
            Enviar Mensaje (Conectando...)
          </MenuItem>,
          <MenuItem key="disconnect" onClick={handleDisconnect}>
            <DisconnectIcon style={{ marginRight: 8 }} />
            Desconectar
          </MenuItem>
        ];
      
      default:
        return null;
    }
  };

  return (
    <Card sx={sx}>
      <CardHeader
        title="Integración WhatsApp"
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
              <TableCell>Número</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {integrations.map((value) => {
              const { label, color } = statusMap[value.status] ?? {
                label: 'Unknown',
                color: 'default',
              };
              const isConnecting = connectingId === value._id;
              
              return (
                <TableRow hover key={value._id}>
                  <TableCell>{value.createdAt}</TableCell>
                  <TableCell>{value.numero}</TableCell>
                  <TableCell>
                    <Chip 
                      color={color} 
                      label={isConnecting ? 'conectando...' : label} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', width: '50px' }}>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        handleMenuOpen(e, value);
                      }}
                      disabled={isConnecting}
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
      
      {/* Menú desplegable dinámico */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {renderMenuItems()}
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