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
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import { usePermissionsStore } from '@/store/permissionsStore';

interface BulkAssignGroupDialogProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: () => void;
}

const BulkAssignGroupDialog = ({
  open,
  onClose,
  selectedIds,
  onComplete,
}: BulkAssignGroupDialogProps) => {
  const { updatePermission, permissions } = usePermissionsStore();
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Get unique group names for autocomplete suggestions
  const existingGroups = [...new Set(permissions.map((p) => p.group).filter(Boolean))] as string[];

  const handleSubmit = async () => {
    if (!group) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Update each permission one by one
      for (let i = 0; i < selectedIds.length; i++) {
        await updatePermission(selectedIds[i], { group });
        setProgress(((i + 1) / selectedIds.length) * 100);
      }
      
      setGroup('');
      onComplete();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to update permissions');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while updating
    setGroup('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Group to {selectedIds.length} Permissions</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will assign the selected group to all {selectedIds.length} selected permissions.
        </Typography>

        <Autocomplete
          freeSolo
          options={existingGroups}
          value={group}
          onChange={(_, newValue) => setGroup(newValue || '')}
          onInputChange={(_, newValue) => setGroup(newValue)}
          disabled={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              required
              helperText="Select an existing group or type a new one"
            />
          )}
        />

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Updating permissions... {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!group || loading}
        >
          {loading ? 'Updating...' : 'Assign Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignGroupDialog;
