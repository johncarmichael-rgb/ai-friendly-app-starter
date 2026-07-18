import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Typography,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCompaniesStore } from '@/store/companiesStore';

interface CreateCompanyDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateCompanyDialog = ({ open, onClose }: CreateCompanyDialogProps) => {
  const { createCompany } = useCompaniesStore();
  const [formData, setFormData] = useState({
    name: '',
    domains: [] as string[],
  });
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDomain = () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;
    if (formData.domains.includes(trimmed)) {
      setNewDomain('');
      return;
    }
    setFormData({ ...formData, domains: [...formData.domains, trimmed] });
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData({ ...formData, domains: formData.domains.filter((d) => d !== domain) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCompany(formData);
      onClose();
      setFormData({ name: '', domains: [] });
      setNewDomain('');
    } catch (error) {
      console.error('Failed to create company:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Company</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Company Name"
          fullWidth
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, mb: 0.5, display: 'block' }}>
          Domains
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, minHeight: 32 }}>
          {formData.domains.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No domains</Typography>
          ) : (
            formData.domains.map((domain) => (
              <Chip
                key={domain}
                label={domain}
                size="small"
                onDelete={() => handleRemoveDomain(domain)}
              />
            ))
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            size="small"
            label="Add domain"
            placeholder="e.g. example.com"
            fullWidth
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddDomain();
              }
            }}
          />
          <IconButton onClick={handleAddDomain} color="primary" disabled={!newDomain.trim()}>
            <AddIcon />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCompanyDialog;
