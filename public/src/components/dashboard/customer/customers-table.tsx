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
  Chip,
} from '@mui/material';

import {
  Plus as PlusIcon,
  Trash as TrashIcon,
  Prohibit as ProhibitIcon,
  MagnifyingGlass as SearchIcon,
  User as UserIcon,
  CheckCircle as CheckCircleIcon,
} from '@phosphor-icons/react/dist/ssr';

import dayjs from 'dayjs';
import { useSelection } from '@/hooks/use-selection';
import { useAppDispatch } from '@/store';
import { updateUserRole, suspendUser, deleteUser, fetchAllUsers } from '@/store/slices/user/user-thunks';

// Constantes
const ROLES = {
  ADMIN: {
    id: '00000001a3bcc48331b0bf15',
    name: 'admin'
  },
  OWNER: {
    id: '682b7e77b43ded5380102510',
    name: 'owner'
  },
  MEMBER: {
    id: '00000003a3bcc48331b0bf1d',
    name: 'member'
  },
} as const;

const ROLE_LABELS = {
  [ROLES.ADMIN.name]: 'Admin',
  [ROLES.OWNER.name]: 'Owner',
  [ROLES.MEMBER.name]: 'Member',
} as const;

const ROLE_COLORS = {
  [ROLES.ADMIN.name]: 'error',
  [ROLES.OWNER.name]: 'warning',
  [ROLES.MEMBER.name]: 'success',
} as const;

export interface Customer {
  id: string;
  avatar: string;
  name: string;
  email: string;
  address: { city: string; state: string; country: string; street: string };
  phone: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: Date;
  isSuspended?: boolean;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Customer[];
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onAddUser?: () => void;
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
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onAddUser,
}: CustomersTableProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  const openConfirmDialog = (title: string, message: string, action: () => void) => {
    setDialogState({
      open: true,
      title,
      message,
      action,
    });
  };

  const closeDialog = () => {
    setDialogState({
      ...dialogState,
      open: false,
    });
  };

  const handleConfirm = () => {
    dialogState.action();
    closeDialog();
  };

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      await dispatch(updateUserRole({ userId, roleId: newRoleId })).unwrap();
      dispatch(fetchAllUsers());
    } catch (error) {
      console.error('Error al actualizar el rol:', error);
    }
  };

  const handleSuspendUser = async (userId: string, isSuspended: boolean) => {
    try {
      await dispatch(suspendUser({ 
        userId, 
        action: isSuspended ? 'activate' : 'suspend',
        reason: isSuspended ? undefined : 'Suspensión administrativa'
      })).unwrap();
      dispatch(fetchAllUsers());
    } catch (error) {
      console.error('Error al suspender/activar usuario:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      dispatch(fetchAllUsers());
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter ? row.role.name === roleFilter : true;
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
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            <Button 
              startIcon={<PlusIcon size={18} />} 
              variant="contained"
              onClick={onAddUser}
            >
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
                    () => Array.from(selected).forEach(userId => handleSuspendUser(userId, false))
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
                    () => Array.from(selected).forEach(handleDeleteUser)
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={ROLE_LABELS[row.role.name as keyof typeof ROLE_LABELS] || row.role.name}
                        color={ROLE_COLORS[row.role.name as keyof typeof ROLE_COLORS] || 'default'}
                        size="small"
                      />
                      <Select
                        size="small"
                        value={row.role.id}
                        onChange={(e) => {
                          const newRoleId = e.target.value;
                          const newRole = Object.values(ROLES).find(role => role.id === newRoleId);
                          openConfirmDialog(
                            'Cambiar rol',
                            `¿Cambiar rol de ${row.role.name} a ${newRole?.name || 'nuevo rol'}?`,
                            () => handleRoleChange(row.id, newRoleId),
                          );
                        }}
                      >
                        {Object.values(ROLES).map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {ROLE_LABELS[role.name]}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </TableCell>
                  <TableCell>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Ver Usuario">
                        <IconButton onClick={() => router.push(`/dashboard/customers/${row.id}`)}>
                          <UserIcon size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={row.isSuspended ? "Activar Usuario" : "Suspender Usuario"}>
                        <IconButton
                          color={row.isSuspended ? "success" : "warning"}
                          onClick={() =>
                            openConfirmDialog(
                              row.isSuspended ? 'Activar usuario' : 'Suspender usuario',
                              `¿Estás seguro de que deseas ${row.isSuspended ? 'activar' : 'suspender'} a ${row.name}?`,
                              () => handleSuspendUser(row.id, row.isSuspended || false),
                            )
                          }
                        >
                          {row.isSuspended ? <CheckCircleIcon size={20} /> : <ProhibitIcon size={20} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Usuario">
                        <IconButton
                          color="error"
                          onClick={() =>
                            openConfirmDialog(
                              'Eliminar usuario',
                              `¿Estás seguro de que deseas eliminar a ${row.name}?`,
                              () => handleDeleteUser(row.id),
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
        rowsPerPageOptions={[10, 25]}
      />
    </Card>
  );
}
