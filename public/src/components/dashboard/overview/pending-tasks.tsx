'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import type { ReactElement } from 'react';

interface Task {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
}

interface PendingTasksProps {
  tasks: Task[];
  sx?: object;
}

export function PendingTasks({ tasks, sx }: PendingTasksProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    description: '',
    priority: 'medium',
    assignedTo: '',
  });

  const priorityMap = {
    high: { color: 'error.main', label: 'Alta' },
    medium: { color: 'warning.main', label: 'Media' },
    low: { color: 'success.main', label: 'Baja' },
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange =
    (field: keyof typeof newTask) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewTask({ ...newTask, [field]: event.target.value });
    };

  const handleSubmit = () => {
    // Aquí deberías implementar la lógica para guardar la nueva tarea
    console.log('Nueva tarea:', {
      ...newTask,
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`, // Genera un ID aleatorio
    });
    handleClose();
    // Resetear el formulario
    setNewTask({
      description: '',
      priority: 'medium',
      assignedTo: '',
    });
  };

  return (
    <Card sx={sx}>
      <CardHeader
        title="Tareas Pendientes"
        action={
          <Button variant="contained" startIcon={<PlusIcon />} onClick={handleOpen} size="small">
            Agregar
          </Button>
        }
      />
      <Divider />
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {tasks.map((task) => (
            <Box key={task.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="body1">{task.description}</Typography>
                <Chip
                  label={priorityMap[task.priority].label}
                  size="small"
                  color={
                    task.priority === 'high'
                      ? 'error'
                      : task.priority === 'medium'
                        ? 'warning'
                        : 'success'
                  }
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <ClockIcon fontSize="var(--icon-fontSize-sm)" />
                <Typography variant="body2" color="text.secondary">
                  Asignado a: {task.assignedTo}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Modal para agregar nueva tarea */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nueva Tarea</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: '400px' }}>
            <TextField
              label="Descripción"
              value={newTask.description}
              onChange={handleChange('description')}
              fullWidth
              required
            />

            <TextField
              label="Asignado a"
              value={newTask.assignedTo}
              onChange={handleChange('assignedTo')}
              fullWidth
              required
            />

            <TextField
              select
              label="Prioridad"
              value={newTask.priority}
              onChange={handleChange('priority')}
              fullWidth
            >
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="low">Baja</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newTask.description || !newTask.assignedTo}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
