import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import AdminService from 'apis/api-mono/services/AdminService';
import { User } from 'apis/api-mono/services/interfaces/User';
import { Role } from 'apis/api-mono/services/interfaces/AdminUsersUserIdRolesPutPut';

interface EditUserSystemRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

// A user is either a platform SUPER_ADMIN or a standard user with no system role.
type SystemRoleChoice = 'NONE' | 'SUPER_ADMIN';

const isSuperAdmin = (roles: string[] | undefined): boolean =>
  (roles || []).includes(Role.SuperAdmin);

const EditUserSystemRoleDialog = ({
  open,
  onClose,
  user,
  onSuccess,
}: EditUserSystemRoleDialogProps) => {
  const [choice, setChoice] = useState<SystemRoleChoice>('NONE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentChoice: SystemRoleChoice = isSuperAdmin(user?.roles) ? 'SUPER_ADMIN' : 'NONE';

  // Reset to the user's current system role each time the dialog opens
  useEffect(() => {
    if (open) {
      setChoice(currentChoice);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?._id]);

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    setError('');

    try {
      await AdminService.adminUsersUserIdRolesPut(
        { roles: choice === 'SUPER_ADMIN' ? [Role.SuperAdmin] : [] },
        { userId: user._id }
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to update system role:', err);
      setError((err as { message?: string })?.message || 'Failed to update system role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit System Role</DialogTitle>
      <DialogContent>
        {user && (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              User: <strong>{user.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current: <strong>{currentChoice === 'SUPER_ADMIN' ? 'Super Admin' : 'Standard user'}</strong>
            </Typography>
          </Box>
        )}

        <TextField
          margin="dense"
          label="System Role"
          fullWidth
          select
          value={choice}
          onChange={(e) => setChoice(e.target.value as SystemRoleChoice)}
          disabled={submitting}
          helperText="Super Admin grants full platform-wide administrative access."
        >
          <MenuItem value="NONE">Standard user (no system role)</MenuItem>
          <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
        </TextField>

        {choice === 'SUPER_ADMIN' && currentChoice !== 'SUPER_ADMIN' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This grants full platform-wide admin access to every company and all admin tooling.
          </Alert>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={choice === currentChoice || submitting}
        >
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserSystemRoleDialog;
