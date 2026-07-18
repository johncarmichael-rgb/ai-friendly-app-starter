import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box,
  Autocomplete,
} from '@mui/material';
import { usePermissionsStore } from '@/store/permissionsStore';
import AdminService from 'apis/api-mono/services/AdminService';

interface RenameGroupDialogProps {
  open: boolean;
  onClose: () => void;
  currentGroupName: string;
  permissionCount: number;
  existingGroups: string[];
}

const RenameGroupDialog = ({
  open,
  onClose,
  currentGroupName,
  permissionCount,
  existingGroups,
}: RenameGroupDialogProps) => {
  const { fetchPermissions } = usePermissionsStore();
  const [newGroupName, setNewGroupName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<{ permissionsUpdated: number; companiesUpdated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewGroupName(currentGroupName);
      setResult(null);
      setError(null);
    }
  }, [open, currentGroupName]);

  const handleSave = async () => {
    if (!newGroupName.trim() || newGroupName === currentGroupName) {
      onClose();
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await AdminService.adminPermissionGroupRenamePost({
        oldName: currentGroupName,
        newName: newGroupName.trim(),
      });
      setResult({
        permissionsUpdated: response.permissionsUpdated,
        companiesUpdated: response.companiesUpdated,
      });
      // Refresh permissions list
      await fetchPermissions();
      // Auto-close after a short delay to show the result
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'Failed to rename group. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  // Filter out current group and "Ungrouped" from suggestions
  const groupSuggestions = existingGroups.filter(
    (g) => g !== currentGroupName && g !== 'Ungrouped'
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rename Group</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Rename "{currentGroupName}" ({permissionCount} permission
          {permissionCount !== 1 ? 's' : ''}). This will update all permissions
          and company roles that use this group.
        </Typography>

        <Autocomplete
          freeSolo
          options={groupSuggestions}
          value={newGroupName}
          onInputChange={(_, value) => setNewGroupName(value)}
          disabled={isUpdating || !!result}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              label="New Group Name"
              fullWidth
              helperText="Type a new name or select an existing group"
            />
          )}
        />

        {isUpdating && (
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Renaming group...
            </Typography>
          </Box>
        )}

        {result && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" color="success.contrastText">
              ✓ Renamed successfully! Updated {result.permissionsUpdated} permission
              {result.permissionsUpdated !== 1 ? 's' : ''} and {result.companiesUpdated} company
              {result.companiesUpdated !== 1 ? ' roles' : ' role'}.
            </Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isUpdating || !newGroupName.trim() || newGroupName === currentGroupName}
        >
          {isUpdating ? 'Updating...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameGroupDialog;
