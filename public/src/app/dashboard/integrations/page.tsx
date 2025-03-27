import * as React from 'react';
import type { Metadata } from 'next';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs from 'dayjs';



import { config } from '@/config';
import { BoardIntegrations } from '@/components/dashboard/integrations/board-integrations';
import { IntegrationCard } from '@/components/dashboard/integrations/integrations-card';
import type { Integration } from '@/components/dashboard/integrations/integrations-card';
import { CompaniesFilters } from '@/components/dashboard/integrations/integrations-filters';





export const metadata = { title: `Integrations | Dashboard | ${config.site.name}` } satisfies Metadata;

const integrations = [
  {
    id: 'INTEG-006',
    title: 'WhatsApp',
    description: 'Integracion con WhatsApp (QR)',
    logo: '/assets/whatsapp.png',
    installs: 594,
    updatedAt: dayjs().subtract(12, 'minute').toDate(),
  },
] satisfies Integration[];

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={5}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Integrations</Typography>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add
          </Button>
        </div>
      </Stack>
      {/* <CompaniesFilters /> */}
      {/*       <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid key={integration.id} lg={4} md={6} xs={12}>
            <IntegrationCard integration={integration} />
          </Grid>
        ))}
      </Grid> */}

      <BoardIntegrations
        sx={{ height: '100%' }}
      />
      {/* <WhatsAppModal /> */}
      {/*       <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination count={3} size="small" />
      </Box> */}
    </Stack>
  );
}