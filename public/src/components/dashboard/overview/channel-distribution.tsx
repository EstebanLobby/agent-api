'use client';

import type { ApexOptions } from 'apexcharts';
import { Box, Card, CardHeader, Divider } from '@mui/material';
import type { ReactElement } from 'react';
import { Chart } from '@/components/core/chart';

interface ChannelDistributionProps {
  chartSeries: number[];
  labels: string[];
  sx?: object;
}

export function ChannelDistribution({
  chartSeries,
  labels,
  sx,
}: ChannelDistributionProps): ReactElement {
  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      type: 'donut',
    },
    colors: ['#25D366', '#006AFF', '#FF6B00', '#8E44AD'],
    dataLabels: { enabled: false },
    labels,
    legend: { position: 'bottom', show: true },
    plotOptions: { pie: { donut: { size: '65%' } } },
    states: { active: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => `${value}%`,
      },
    },
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Distribución por Canales" />
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Chart width={300} height={300} options={chartOptions} series={chartSeries} type="donut" />
      </Box>
    </Card>
  );
}
