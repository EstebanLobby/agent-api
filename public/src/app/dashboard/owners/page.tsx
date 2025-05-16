import React from 'react';
import { Container } from '@mui/material';
import OwnerUsersManagement from '@/components/dashboard/owner/owner-users-management';
import { config } from '@/config';
import type { Metadata } from 'next';

export const metadata = {
  title: `Owners ${config.site.name}`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Container maxWidth="xl">
      <OwnerUsersManagement />
    </Container>
  );
}
