import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography } from '@mui/material';

import { config } from '@/config';
import { BoardIntegrations } from '@/components/dashboard/integrations/board-integrations';
import { BoardResource } from '@/components/dashboard/integrations/board-resource';

export const metadata = {
  title: `Integracion ${config.site.name}`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={5}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Integracion</Typography>
        </Stack>
      </Stack>
      <BoardIntegrations sx={{ height: '100%' }} />
      <BoardResource sx={{ height: '100%' }} />
    </Stack>
  );
}
