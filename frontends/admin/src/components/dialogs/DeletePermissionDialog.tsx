import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { usePermissionsStore } from '@/store/permissionsStore';
import { Permission } from 'apis/api-mono/services/interfaces/Permission';

interface DeletePermissionDialogProps {
  open: boolean;
  onClose: () => void;
  permission: Permission;
}

const DeletePermissionDialog = ({ open, onClose, permission }: DeletePermissionDialogProps) => {
  const { deletePermission } = usePermissionsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deletePermission(permission._id);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Permission</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>
          Are you sure you want to delete the permission{' '}
          <strong>{permission.name}</strong> ({permission.code})?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone. Any roles using this permission will no longer have it.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePermissionDialog;
