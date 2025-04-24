'use client';

import { Box, Card, CardHeader, Divider, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';

interface ResolutionData {
  label: string;
  value: number;
  color?: string;
}

interface ResolutionRateProps {
  data: ResolutionData[];
  sx?: object;
}

export function ResolutionRate({ data, sx }: ResolutionRateProps): ReactElement {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card sx={sx}>
      <CardHeader title="Tasa de Resolución" />
      <Divider />
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {data.map((item) => (
            <Stack key={item.label} spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1">{item.label}</Typography>
                <Typography variant="subtitle1">{`${Math.round((item.value / total) * 100)}%`}</Typography>
              </Stack>
              <Box sx={{ height: 8, bgcolor: 'divider', borderRadius: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${(item.value / total) * 100}%`,
                    bgcolor: item.color || 'primary.main',
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
