'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';

export interface MetricCardProps {
  /** Título que se muestra en la parte superior de la card */
  title: string;
  /** Valor principal a mostrar */
  value: string;
  /** Icono que se muestra en el avatar (componente de Phosphor Icons) */
  icon: React.ReactNode;
  /** Color de fondo del avatar */
  avatarColor?: string;
  /** Porcentaje de diferencia (opcional) */
  diff?: number;
  /** Tendencia: 'up' para aumento, 'down' para disminución */
  trend?: 'up' | 'down';
  /** Texto descriptivo de la tendencia (ej: "Desde el mes pasado") */
  trendText?: string;
  /** Estilos personalizados */
  sx?: SxProps;
}

export function MetricCard({
  title,
  value,
  icon,
  avatarColor = 'var(--mui-palette-primary-main)',
  diff,
  trend,
  trendText = 'Since last month',
  sx,
}: MetricCardProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor =
    trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                {title}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: avatarColor,
                height: '56px',
                width: '56px',
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                fontSize: 'var(--icon-fontSize-lg)',
              })}
            </Avatar>
          </Stack>
          {diff && trend ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                {trendText}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
