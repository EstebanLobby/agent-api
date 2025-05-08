'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

import {
  Plus as PlusIcon,
  Trash as TrashIcon,
  Prohibit as ProhibitIcon,
  MagnifyingGlass as SearchIcon,
  User as UserIcon,
} from '@phosphor-icons/react/dist/ssr';

import dayjs from 'dayjs';
import { useSelection } from '@/hooks/use-selection';

export interface Customer {
  id: string;
  avatar: string;
  name: string;
  email: string;
  address: { city: string; state: string; country: string; street: string };
  phone: string;
  role: string;
  createdAt: Date;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

// Interfaz para el diálogo
interface DialogState {
  open: boolean;
  title: string;
  message: string;
  action: () => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
}: CustomersTableProps): React.JSX.Element {
  // Estado del diálogo mejorado
  const [dialogState, setDialogState] = React.useState<DialogState>({
    open: false,
    title: '',
    message: '',
    action: () => {},
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(page);
  const [rowsPerPageState, setRowsPerPageState] = React.useState(rowsPerPage);
  const router = useRouter();

  // Función para abrir el diálogo con parámetros específicos
  const openConfirmDialog = (title: string, message: string, action: () => void) => {
    setDialogState({
      open: true,
      title,
      message,
      action,
    });
  };

  // Función para cerrar el diálogo
  const closeDialog = () => {
    setDialogState({
      ...dialogState,
      open: false,
    });
  };

  // Función para ejecutar la acción y cerrar el diálogo
  const handleConfirm = () => {
    dialogState.action();
    closeDialog();
  };

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter ? row.role === roleFilter : true;
      return matchesSearch && matchesRole;
    });
  }, [rows, searchTerm, roleFilter]);

  const paginatedRows = React.useMemo(() => {
    const start = currentPage * rowsPerPageState;
    return filteredRows.slice(start, start + rowsPerPageState);
  }, [filteredRows, currentPage, rowsPerPageState]);

  const rowIds = React.useMemo(() => filteredRows.map((customer) => customer.id), [filteredRows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = selected.size > 0 && selected.size < filteredRows.length;
  const selectedAll = filteredRows.length > 0 && selected.size === filteredRows.length;

  const handleChangePage = (_: unknown, newPage: number) => {
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPageState(newRowsPerPage);
    setCurrentPage(0);
    onRowsPerPageChange?.(newRowsPerPage);
  };

  return (
    <Card>
      {/* Top Actions */}
      <Box p={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <TextField
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ width: 300 }}
          />
          <Stack direction="row" spacing={1}>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos los roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">Usuario</MenuItem>
            </Select>
            <Button startIcon={<PlusIcon size={18} />} variant="contained">
              Nuevo Usuario
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <Box px={2} pb={1}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Suspender usuarios seleccionados">
              <Button
                variant="outlined"
                color="warning"
                onClick={() =>
                  openConfirmDialog(
                    'Confirmar suspensión',
                    '¿Estás seguro de que deseas suspender los usuarios seleccionados?',
                    () => console.log('Suspendiendo usuarios', Array.from(selected)),
                  )
                }
              >
                Suspender
              </Button>
            </Tooltip>
            <Tooltip title="Eliminar usuarios seleccionados">
              <Button
                variant="outlined"
                color="error"
                onClick={() =>
                  openConfirmDialog(
                    'Confirmar eliminación',
                    '¿Estás seguro de que deseas eliminar los usuarios seleccionados?',
                    () => console.log('Eliminando usuarios', Array.from(selected)),
                  )
                }
              >
                Eliminar
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* Diálogo reutilizable */}
      <Dialog open={dialogState.open} onClose={closeDialog} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogState.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={handleConfirm} color="error" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                />
              </TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Registrado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const isSelected = selected.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => (e.target.checked ? selectOne(row.id) : deselectOne(row.id))}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={row.avatar} />
                      <Typography variant="subtitle2">{row.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {row.address.city}, {row.address.state}, {row.address.country}
                  </TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={row.role}
                      onChange={(e) =>
                        openConfirmDialog(
                          'Cambiar rol',
                          `¿Cambiar rol de ${row.name} a ${e.target.value}?`,
                          () => console.log(`Cambiando rol de ${row.name} a ${e.target.value}`),
                        )
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">Usuario</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Ver Usuario">
                        <IconButton onClick={() => router.push(`/dashboard/customers/0001`)}>
                          <UserIcon size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Suspender Usuario">
                        <IconButton
                          color="warning"
                          onClick={() =>
                            openConfirmDialog(
                              'Suspender usuario',
                              `¿Estás seguro de que deseas suspender a ${row.name}?`,
                              () => console.log(`Suspendiendo a ${row.name}`),
                            )
                          }
                        >
                          <ProhibitIcon size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Usuario">
                        <IconButton
                          color="error"
                          onClick={() =>
                            openConfirmDialog(
                              'Eliminar usuario',
                              `¿Estás seguro de que deseas eliminar a ${row.name}?`,
                              () => console.log(`Eliminando a ${row.name}`),
                            )
                          }
                        >
                          <TrashIcon size={20} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={currentPage}
        rowsPerPage={rowsPerPageState}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
