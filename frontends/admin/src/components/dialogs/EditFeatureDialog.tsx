import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useFeaturesStore } from '@/store/featuresStore';
import { Feature } from 'apis/api-mono/services/interfaces/Feature';

interface EditFeatureDialogProps {
  open: boolean;
  onClose: () => void;
  feature: Feature;
}

const EditFeatureDialog = ({ open, onClose, feature }: EditFeatureDialogProps) => {
  const { updateFeature } = useFeaturesStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (feature) {
      setFormData({
        name: feature.name || '',
        description: feature.description || '',
        isActive: feature.isActive ?? true,
      });
    }
  }, [feature]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateFeature(feature._id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update feature:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Feature</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Feature Code"
          fullWidth
          value={feature.code}
          disabled
          helperText="Feature code cannot be changed"
          sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)' } }}
        />
        <TextField
          autoFocus
          margin="dense"
          label="Feature Name"
          fullWidth
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          helperText="Display name for the feature"
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          helperText="Detailed description of what the feature provides"
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          }
          label="Active"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFeatureDialog;
