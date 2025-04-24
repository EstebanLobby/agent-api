'use client';

import * as React from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import type { Customer } from '@/components/dashboard/customer/customers-table';

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const page = 0;
  const rowsPerPage = 5;

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/users/all', {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('No se pudo obtener la lista de usuarios');
      }

      const data = await res.json();

      // Adaptamos el formato para que encaje con Customer
      const formatted = data.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: '/assets/avatar-placeholder.png', // default o dinámico si tenés
        address: {
          city: user.address?.city || '',
          country: user.address?.country || '',
          state: user.address?.state || '',
          street: user.address?.street || '',
        },
        createdAt: new Date(user.createdAt),
      }));

      setCustomers(formatted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAllUsers();
  }, []);

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Clientes</Typography>
        </Stack>
      </Stack>

      {error ? <Typography color="error">{error}</Typography> : null}
      {loading ? (
        <Typography>Cargando usuarios...</Typography>
      ) : (
        <CustomersTable
          count={customers.length}
          page={page}
          rows={paginatedCustomers}
          rowsPerPage={rowsPerPage}
        />
      )}
    </Stack>
  );
}
