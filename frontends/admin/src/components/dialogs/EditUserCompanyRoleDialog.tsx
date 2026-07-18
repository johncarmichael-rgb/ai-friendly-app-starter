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
} from '@mui/material';
import AdminService from 'apis/api-mono/services/AdminService';
import { User } from 'apis/api-mono/services/interfaces/User';
import { Company } from 'apis/api-mono/services/interfaces/Company';
import { useCompaniesStore } from '@/store/companiesStore';

interface EditUserCompanyRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  company: Company | null;
  currentRole: string;
  onSuccess?: () => void;
}

const EditUserCompanyRoleDialog = ({
  open,
  onClose,
  user,
  company,
  currentRole,
  onSuccess,
}: EditUserCompanyRoleDialogProps) => {
  const [role, setRole] = useState(currentRole);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { companyMembers } = useCompaniesStore();

  const availableRoles = company?.roles || [];

  // Reset role when dialog opens
  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setError('');
    }
  }, [open, currentRole]);

  const handleSubmit = async () => {
    if (!user || !company) return;

    // Find the company member record
    const members = companyMembers.get(company._id) || [];
    const memberRecord = members.find((m: any) => {
      const memberId = m.companyMember?.userId || m.userId;
      return memberId === user._id;
    });

    if (!memberRecord) {
      setError('Company member record not found');
      return;
    }

    const companyMemberId = (memberRecord as any).companyMember?._id || (memberRecord as any)._id;

    setSubmitting(true);
    setError('');

    try {
      await AdminService.adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut(
        { role },
        {
          companyId: company._id,
          companyMemberId,
        }
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      setError(err?.message || 'Failed to update user role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User Role</DialogTitle>
      <DialogContent>
        {user && company && (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              User: <strong>{user.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Company: <strong>{company.name}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Role: <strong>{currentRole}</strong>
            </Typography>
          </Box>
        )}

        <TextField
          margin="dense"
          label="New Role"
          fullWidth
          select
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={submitting || availableRoles.length === 0}
          helperText={
            availableRoles.length === 0
              ? 'No roles defined for this company'
              : 'Select the new role for this user'
          }
        >
          {availableRoles.length === 0 ? (
            <MenuItem disabled>No roles available</MenuItem>
          ) : (
            availableRoles.map((roleOption) => (
              <MenuItem key={roleOption.name} value={roleOption.name}>
                {roleOption.name}
                {roleOption.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    - {roleOption.description}
                  </Typography>
                )}
              </MenuItem>
            ))
          )}
        </TextField>

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
          disabled={!role || role === currentRole || submitting || availableRoles.length === 0}
        >
          {submitting ? 'Updating...' : 'Update Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserCompanyRoleDialog;
