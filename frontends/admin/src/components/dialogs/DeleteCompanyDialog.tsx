import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useCompaniesStore } from '@/store/companiesStore';

interface DeleteCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  company: any;
}

const DeleteCompanyDialog = ({ open, onClose, company }: DeleteCompanyDialogProps) => {
  const { deleteCompany } = useCompaniesStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCompany(company._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete company:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Company</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{company?.name}</strong>?
          This action cannot be undone.
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

export default DeleteCompanyDialog;
