'use client';

import type { ApexOptions } from 'apexcharts';
import { Box, Card, CardHeader, Divider } from '@mui/material';
import type { ReactElement } from 'react';
import { Chart } from '@/components/core/chart';

interface MessageVolumeProps {
  chartSeries: { name: string; data: number[] }[];
  sx?: object;
}

export function MessageVolume({ chartSeries, sx }: MessageVolumeProps): ReactElement {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
    },
    colors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-info-main)'],
    dataLabels: { enabled: false },
    fill: { opacity: 0.16, type: 'solid' },
    grid: { strokeDashArray: 2 },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: ['3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'],
      labels: { style: { colors: 'var(--mui-palette-text-secondary)' } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}`,
        style: { colors: 'var(--mui-palette-text-secondary)' },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value) => `${value} mensajes`,
      },
    },
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Volumen de Mensajes por Hora" />
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Chart width={500} height={300} options={chartOptions} series={chartSeries} type="area" />
      </Box>
    </Card>
  );
}
