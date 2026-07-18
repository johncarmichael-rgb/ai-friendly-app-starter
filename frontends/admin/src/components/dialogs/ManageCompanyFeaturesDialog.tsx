import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useFeaturesStore } from '@/store/featuresStore';
import { useCompaniesStore } from '@/store/companiesStore';
import { Company } from 'apis/api-mono/services/interfaces/Company';

interface ManageCompanyFeaturesDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company;
}

const ManageCompanyFeaturesDialog = ({
  open,
  onClose,
  company,
}: ManageCompanyFeaturesDialogProps) => {
  const { features, fetchFeatures, loading: featuresLoading } = useFeaturesStore();
  const { updateCompanyFeatures } = useCompaniesStore();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchFeatures();
      setSelectedCodes(company.featureCodes || []);
      setError(null);
    }
  }, [open, company, fetchFeatures]);

  const handleToggle = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateCompanyFeatures(company._id, selectedCodes);
      onClose();
    } catch (err) {
      setError('Failed to update feature codes');
      console.error('Failed to update feature codes:', err);
    } finally {
      setSaving(false);
    }
  };

  // Filter to only show active features
  const activeFeatures = features.filter((f) => f.isActive !== false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Manage Features for {company.name}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the features this company should have access to.
        </Typography>

        {featuresLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : activeFeatures.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No features available. Create features first.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {activeFeatures.map((feature) => {
              const isSelected = selectedCodes.includes(feature.code);
              return (
                <ListItem key={feature._id} disablePadding>
                  <ListItemButton onClick={() => handleToggle(feature.code)} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{feature.name}</Typography>
                          <Chip
                            label={feature.code}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                          />
                        </Box>
                      }
                      secondary={feature.description}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}

        {selectedCodes.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Features ({selectedCodes.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedCodes.map((code) => (
                <Chip
                  key={code}
                  label={code}
                  size="small"
                  onDelete={() => handleToggle(code)}
                  sx={{ fontFamily: 'monospace' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageCompanyFeaturesDialog;
