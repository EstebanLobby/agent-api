'use client';

import type { ApexOptions } from 'apexcharts';
import { Box, Card, CardHeader, Divider } from '@mui/material';
import type { ReactElement } from 'react';
import { Chart } from '@/components/core/chart';

interface SatisfactionTrendProps {
  chartSeries: { name: string; data: number[] }[];
  sx?: object;
}

export function SatisfactionTrend({ chartSeries, sx }: SatisfactionTrendProps): ReactElement {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    colors: ['var(--mui-palette-primary-main)'],
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 3 },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      labels: { style: { colors: 'var(--mui-palette-text-secondary)' } },
    },
    yaxis: {
      min: 1,
      max: 5,
      tickAmount: 4,
      labels: {
        formatter: (value) => value.toFixed(1),
        style: { colors: 'var(--mui-palette-text-secondary)' },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}/5`,
      },
    },
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Evolución de Satisfacción" />
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Chart width={500} height={300} options={chartOptions} series={chartSeries} type="line" />
      </Box>
    </Card>
  );
}
