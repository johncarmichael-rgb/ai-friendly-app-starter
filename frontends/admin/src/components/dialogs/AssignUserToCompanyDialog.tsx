import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import AdminService from 'apis/api-mono/services/AdminService';
import { User } from 'apis/api-mono/services/interfaces/User';
import { Company } from 'apis/api-mono/services/interfaces/Company';
import { useCompaniesStore } from '@/store/companiesStore';

interface AssignUserToCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const AssignUserToCompanyDialog = ({
  open,
  onClose,
  user,
  onSuccess,
}: AssignUserToCompanyDialogProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { getUserCompanies } = useCompaniesStore();
  
  // Get the selected company's roles
  const selectedCompany = companies.find(c => c._id === selectedCompanyId);
  const availableRoles = selectedCompany?.roles || [];

  // Fetch companies when dialog opens
  useEffect(() => {
    if (open) {
      fetchCompanies();
      // Reset form state
      setSelectedCompanyId('');
      setRole('');
      setError('');
    }
  }, [open, user]);

  // Auto-select first role when company is selected
  useEffect(() => {
    if (selectedCompanyId && availableRoles.length > 0) {
      setRole(availableRoles[0].name);
    } else {
      setRole('');
    }
  }, [selectedCompanyId, availableRoles]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const result = await AdminService.adminCompanyGet({
        offset: 0,
        limit: 100,
      });
      setCompanies(result || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedCompanyId) return;

    setSubmitting(true);
    setError('');

    try {
      await AdminService.adminCompanyCompanyIdCompanyMemberPost(
        {
          companyId: selectedCompanyId,
          userId: user._id,
          role,
        },
        {
          companyId: selectedCompanyId,
        }
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to assign user to company:', err);
      setError(err?.message || 'Failed to assign user to company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign User to Company</DialogTitle>
      <DialogContent>
        {user && (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              User: <strong>{user.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Name: <strong>{user.firstName} {user.lastName}</strong>
            </Typography>
            
            {/* Show user's existing companies */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Companies:
              </Typography>
              {(() => {
                const userCompanies = getUserCompanies(user._id);
                return userCompanies.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Not assigned to any companies
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {userCompanies.map((company) => (
                      <Chip
                        key={company._id}
                        label={company.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                );
              })()}
            </Box>
          </Box>
        )}

        {loadingCompanies ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <TextField
              margin="dense"
              label="Company"
              fullWidth
              select
              required
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              disabled={submitting}
              helperText="Select a company to assign this user to"
            >
              {companies.length === 0 ? (
                <MenuItem disabled>No companies available</MenuItem>
              ) : (
                (() => {
                  const userCompanies = user ? getUserCompanies(user._id) : [];
                  const userCompanyIds = new Set(userCompanies.map(c => c._id));
                  
                  return companies.map((company) => {
                    const isAlreadyMember = userCompanyIds.has(company._id);
                    return (
                      <MenuItem 
                        key={company._id} 
                        value={company._id}
                        disabled={isAlreadyMember}
                      >
                        {company.name}
                        {isAlreadyMember && (
                          <Chip 
                            label="Already member" 
                            size="small" 
                            sx={{ ml: 1 }} 
                            color="success"
                          />
                        )}
                      </MenuItem>
                    );
                  });
                })()
              )}
            </TextField>

            <TextField
              margin="dense"
              label="Role"
              fullWidth
              select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={submitting || !selectedCompanyId || availableRoles.length === 0}
              helperText={availableRoles.length === 0 ? 'No roles defined for this company' : 'Select the user\'s role in the company'}
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
          </>
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
          disabled={!selectedCompanyId || !role || submitting || loadingCompanies}
        >
          {submitting ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUserToCompanyDialog;
