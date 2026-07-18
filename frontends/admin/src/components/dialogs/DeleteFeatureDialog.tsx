import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useFeaturesStore } from '@/store/featuresStore';
import { Feature } from 'apis/api-mono/services/interfaces/Feature';

interface DeleteFeatureDialogProps {
  open: boolean;
  onClose: () => void;
  feature: Feature;
}

const DeleteFeatureDialog = ({ open, onClose, feature }: DeleteFeatureDialogProps) => {
  const { deleteFeature } = useFeaturesStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFeature(feature._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete feature:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Feature</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the feature <strong>{feature?.name}</strong> ({feature?.code})?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone. Companies using this feature will lose access to it.
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

export default DeleteFeatureDialog;
