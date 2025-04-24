'use client';

import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import dayjs from 'dayjs';
import type { ReactElement } from 'react';

interface Query {
  id: string;
  guest: { name: string; room?: string };
  query: string;
  channel: string;
  status: 'resolved' | 'pending' | 'transferred';
  createdAt: Date;
}

interface LatestQueriesProps {
  queries: Query[];
  sx?: object;
}

export function LatestQueries({ queries, sx }: LatestQueriesProps): ReactElement {
  const statusMap = {
    resolved: { color: 'success.main', label: 'Resuelto' },
    pending: { color: 'warning.main', label: 'Pendiente' },
    transferred: { color: 'info.main', label: 'Transferido' },
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Últimas Consultas" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Huésped</TableCell>
              <TableCell>Consulta</TableCell>
              <TableCell>Canal</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Hora</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queries.map((query) => (
              <TableRow key={query.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ bgcolor: 'action.active', height: 36, width: 36 }}>
                      <UserIcon fontSize="var(--icon-fontSize-md)" />
                    </Avatar>
                    <div>
                      <Typography variant="body1">{query.guest.name}</Typography>
                      {query.guest.room ? (
                        <Typography variant="body2" color="text.secondary">
                          Hab. {query.guest.room}
                        </Typography>
                      ) : null}
                    </div>
                  </Stack>
                </TableCell>
                <TableCell>{query.query}</TableCell>
                <TableCell>{query.channel}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      bgcolor: statusMap[query.status].color,
                      borderRadius: 1,
                      color: 'common.white',
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    {statusMap[query.status].label}
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ClockIcon fontSize="var(--icon-fontSize-sm)" />
                    <Typography variant="body2">
                      {dayjs(query.createdAt).format('HH:mm')}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
