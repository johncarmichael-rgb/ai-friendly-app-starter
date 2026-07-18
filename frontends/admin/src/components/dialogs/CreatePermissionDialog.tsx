import { useState } from 'react';
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

interface CreatePermissionDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreatePermissionDialog = ({ open, onClose }: CreatePermissionDialogProps) => {
  const { createPermission, permissions } = usePermissionsStore();
  const [formData, setFormData] = useState({ code: '', name: '', group: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get unique group names for autocomplete suggestions
  const existingGroups = [...new Set(permissions.map((p) => p.group).filter(Boolean))] as string[];

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) return;

    setLoading(true);
    setError(null);
    try {
      await createPermission({
        code: formData.code,
        name: formData.name,
        group: formData.group || undefined,
      });
      setFormData({ code: '', name: '', group: '' });
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create permission');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ code: '', name: '', group: '' });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Custom Permission</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Permission Code"
          fullWidth
          required
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          helperText="Unique identifier for the permission (e.g., 'customFeatureAccess')"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Permission Name"
          fullWidth
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          helperText="Human-readable name for the permission"
          sx={{ mb: 2 }}
        />
        <Autocomplete
          freeSolo
          options={existingGroups}
          value={formData.group}
          onChange={(_, newValue) => setFormData({ ...formData, group: newValue || '' })}
          onInputChange={(_, newValue) => setFormData({ ...formData, group: newValue })}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.code || !formData.name || loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePermissionDialog;
