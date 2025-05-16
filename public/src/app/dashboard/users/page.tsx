'use client';

import React from 'react';
import { Container } from '@mui/material';
import UserRoleManagement from '@/components/dashboard/admin/user-role-management';

export default function UsersPage(): React.JSX.Element {
  return (
    <Container maxWidth="xl">
      <UserRoleManagement />
    </Container>
  );
}
