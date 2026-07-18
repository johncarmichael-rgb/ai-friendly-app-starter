import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Autocomplete,
} from '@mui/material';
import { usePermissionsStore } from '@/store/permissionsStore';
import { Permission } from 'apis/api-mono/services/interfaces/Permission';

interface EditPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  permission: Permission;
}

const EditPermissionDialog = ({ open, onClose, permission }: EditPermissionDialogProps) => {
  const { updatePermission, permissions } = usePermissionsStore();
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get unique group names for autocomplete suggestions
  const existingGroups = [...new Set(permissions.map((p) => p.group).filter(Boolean))] as string[];

  useEffect(() => {
    if (permission) {
      setName(permission.name);
      setGroup(permission.group || '');
    }
  }, [permission]);

  const handleSubmit = async () => {
    if (!name) return;

    setLoading(true);
    setError(null);
    try {
      await updatePermission(permission._id, { name, group: group || undefined });
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Permission</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          margin="dense"
          label="Permission Code"
          fullWidth
          value={permission.code}
          disabled
          helperText="Permission code cannot be changed"
          sx={{
            mb: 2,
            '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)' },
          }}
        />
        <TextField
          autoFocus
          margin="dense"
          label="Permission Name"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText="Human-readable name for the permission"
          sx={{ mb: 2 }}
        />
        <Autocomplete
          freeSolo
          options={existingGroups}
          value={group}
          onChange={(_, newValue) => setGroup(newValue || '')}
          onInputChange={(_, newValue) => setGroup(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="Group"
              fullWidth
              helperText="Group name for organizing permissions (e.g., 'Company Management')"
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPermissionDialog;
