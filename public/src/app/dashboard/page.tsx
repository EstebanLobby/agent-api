import * as React from 'react';
import type { Metadata } from 'next';
import dayjs from 'dayjs';

import { config } from '@/config';

import { MetricCard } from '@/components/dashboard/overview/metric-card';
import {
  ChatCircleText as ChatCircleTextIcon,
  Robot as RobotIcon,
  Clock as ClockIcon,
  Handshake as HandshakeIcon,
  Star as StarIcon,
  WhatsappLogo as WhatsappLogoIcon,
  Clipboard as ClipboardIcon,
  Calendar as CalendarIcon,
} from '@phosphor-icons/react/dist/ssr';

import { MessageVolume } from '@/components/dashboard/overview/message-volume';
import { ChannelDistribution } from '@/components/dashboard/overview/channel-distribution';
import { ResolutionRate } from '@/components/dashboard/overview/resolution-rate';
import { LatestQueries } from '@/components/dashboard/overview/latest-queries';
import { SatisfactionTrend } from '@/components/dashboard/overview/satisfaction-trend';
import { PendingTasks } from '@/components/dashboard/overview/pending-tasks';
import { Grid } from '@mui/material';

export const metadata = { title: `Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={2}>
      {/* Primera fila: Métricas clave */}
      <Grid container spacing={3} sx={{ pl: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Mensajes Totales"
            value="1,248"
            icon={<ChatCircleTextIcon />}
            diff={12}
            trend="up"
            trendText="Desde ayer"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Resueltos por IA"
            value="892 (71%)"
            icon={<RobotIcon />}
            diff={8}
            trend="up"
            trendText="Desde ayer"
            avatarColor="var(--mui-palette-success-main)"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Tiempo Respuesta"
            value="2.4 min"
            icon={<ClockIcon />}
            diff={-0.7}
            trend="down"
            trendText="Desde ayer"
            avatarColor="var(--mui-palette-info-main)"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Transferencias"
            value="156 (12%)"
            icon={<HandshakeIcon />}
            diff={-3}
            trend="down"
            trendText="Desde ayer"
            avatarColor="var(--mui-palette-warning-main)"
          />
        </Grid>
      </Grid>

      {/* Segunda fila: Métricas adicionales */}
      <Grid container spacing={3} sx={{ pl: 3, mt: 1 }}>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Satisfacción"
            value="4.7/5"
            icon={<StarIcon />}
            diff={0.2}
            trend="up"
            avatarColor="var(--mui-palette-primary-main)"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="WhatsApp"
            value="648 (52%)"
            icon={<WhatsappLogoIcon />}
            diff={15}
            trend="up"
            avatarColor="#25D366"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Tareas Pendientes"
            value="24"
            icon={<ClipboardIcon />}
            diff={-2}
            trend="down"
            avatarColor="var(--mui-palette-secondary-main)"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MetricCard
            title="Check-ins Automatizados"
            value="143"
            icon={<CalendarIcon />}
            diff={18}
            trend="up"
            avatarColor="var(--mui-palette-success-main)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ pl: 3, mb: 4, mt: 1 }}>
        {/* Gráfico de volumen de mensajes */}
        <Grid item lg={4.5} xs={12}>
          <MessageVolume
            chartSeries={[
              { name: 'Este mes', data: [120, 180, 150, 210, 190, 240, 230, 280] },
              { name: 'Mes anterior', data: [80, 120, 110, 140, 130, 170, 150, 200] },
            ]}
            sx={{ height: '100%' }}
          />
        </Grid>

        {/* Distribución por canales */}
        <Grid item lg={3} md={6} xs={12}>
          <ChannelDistribution
            chartSeries={[52, 25, 15, 8]}
            labels={['WhatsApp', 'SMS', 'Web Chat', 'Otros']}
            sx={{ height: '100%' }}
          />
        </Grid>

        {/* Tasa de resolución */}
        <Grid item lg={4.5} md={6} xs={12}>
          <ResolutionRate
            data={[
              { label: 'IA', value: 71 },
              { label: 'Agente', value: 17 },
              { label: 'No resuelto', value: 12 },
            ]}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>

      <Grid lg={12} md={12} xs={12} sx={{ pl: 3 }}>
        <LatestQueries
          queries={[
            {
              id: 'QRY-001',
              guest: { name: 'Ana Rodríguez', room: '305' },
              query: '¿A qué hora es el check-out?',
              channel: 'WhatsApp',
              status: 'resolved',
              createdAt: dayjs().subtract(15, 'minutes').toDate(),
            },
            {
              id: 'QRY-002',
              guest: { name: 'Carlos Méndez', room: '412' },
              query: 'Necesito toallas adicionales',
              channel: 'Web Chat',
              status: 'pending',
              createdAt: dayjs().subtract(32, 'minutes').toDate(),
            },
            {
              id: 'QRY-003',
              guest: { name: 'Laura Fernández', room: '210' },
              query: '¿Tienen servicio a la habitación ahora?',
              channel: 'WhatsApp',
              status: 'transferred',
              createdAt: dayjs().subtract(45, 'minutes').toDate(),
            },
            {
              id: 'QRY-004',
              guest: { name: 'John Smith', room: '156' },
              query: 'Problema con el WiFi',
              channel: 'SMS',
              status: 'resolved',
              createdAt: dayjs().subtract(2, 'hours').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>

      <Grid container spacing={3} sx={{ pl: 3, mb: 4, mt: 2 }}>
        {/* Gráfico de tendencia de satisfacción */}
        <Grid item lg={6} md={6} xs={12}>
          <SatisfactionTrend
            chartSeries={[
              {
                name: 'Satisfacción',
                data: [4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.7],
              },
            ]}
            sx={{
              height: '100%',
              minHeight: { xs: '300px', md: '100%' },
            }}
          />
        </Grid>

        {/* Lista de tareas pendientes */}
        <Grid item lg={6} md={6} xs={12}>
          <PendingTasks
            tasks={[
              {
                id: 'TSK-001',
                description: 'Seguimiento consulta WiFi habitación 156',
                priority: 'high',
                assignedTo: 'Juan Pérez',
              },
              {
                id: 'TSK-002',
                description: 'Confirmar reserva spa para Sra. Rodríguez',
                priority: 'medium',
                assignedTo: 'María Gómez',
              },
              {
                id: 'TSK-003',
                description: 'Verificar petición almohadas extras habitación 210',
                priority: 'low',
                assignedTo: 'Pedro Martínez',
              },
            ]}
            sx={{
              height: '100%',
              minHeight: { xs: '300px', md: '100%' },
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
