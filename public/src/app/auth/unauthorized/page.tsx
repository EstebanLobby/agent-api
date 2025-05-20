'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { paths } from '@/paths';
import RouterLink from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'error.main',
              mb: 2,
            }}
          >
            Acceso No Autorizadoa
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
            }}
          >
            No tienes permisos para acceder a esta página.
          </Typography>

          <Button
            component={RouterLink}
            href={paths.home}
            variant="contained"
            color="primary"
          >
            Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 