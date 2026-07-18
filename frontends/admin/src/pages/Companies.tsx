import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExtensionIcon from '@mui/icons-material/Extension';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCompaniesStore } from '@/store/companiesStore';
import AdminService from 'apis/api-mono/services/AdminService';
import CreateCompanyDialog from '@/components/dialogs/CreateCompanyDialog';
import EditCompanyDialog from '@/components/dialogs/EditCompanyDialog';
import DeleteCompanyDialog from '@/components/dialogs/DeleteCompanyDialog';
import ManageCompanyFeaturesDialog from '@/components/dialogs/ManageCompanyFeaturesDialog';

const Companies = () => {
  const { companies, loading, fetchCompanies } = useCompaniesStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resettingRoleId, setResettingRoleId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleView = (company: any) => {
    console.log('Handle company viewed clicked');
    setSelectedCompany(company);
    setViewDialogOpen(true);
  };

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setEditDialogOpen(true);
  };

  const handleDelete = (company: any) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleManageFeatures = (company: any) => {
    setSelectedCompany(company);
    setFeaturesDialogOpen(true);
  };

  const handleResetAdminRole = async (company: any) => {
    setResettingRoleId(company._id);
    try {
      await AdminService.adminCompanyCompanyIdRoleRoleNameResetPost({
        companyId: company._id,
        roleName: 'Admin',
      });
      fetchCompanies();
    } catch (error) {
      console.error('Failed to reset ADMIN role permissions', error);
    } finally {
      setResettingRoleId(null);
    }
  };

  const formatDomains = (domains: string[]) => {
    if (!domains || domains.length === 0) return '-';
    return domains.join(', ');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Company
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Domains</TableCell>
              <TableCell>Features</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No companies found. Create your first company to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company._id} hover>
                  <TableCell>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => handleView(company)}
                    >
                      {company.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDomains(company.domains)}</TableCell>
                  <TableCell>
                    {company.featureCodes && company.featureCodes.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {company.featureCodes.slice(0, 3).map((code: string) => (
                          <Chip
                            key={code}
                            label={code}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                          />
                        ))}
                        {company.featureCodes.length > 3 && (
                          <Chip
                            label={`+${company.featureCodes.length - 3}`}
                            size="small"
                            color="default"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleResetAdminRole(company)}
                      sx={{ mr: 1 }}
                      title="Reset ADMIN Role Permissions"
                      disabled={resettingRoleId === company._id}
                    >
                      {resettingRoleId === company._id ? (
                        <CircularProgress size={18} />
                      ) : (
                        <RefreshIcon fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleManageFeatures(company)}
                      sx={{ mr: 1 }}
                      title="Manage Features"
                    >
                      <ExtensionIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(company)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(company)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateCompanyDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {selectedCompany && (
        <>
          <EditCompanyDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedCompany(null);
            }}
            company={selectedCompany}
          />
          <DeleteCompanyDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedCompany(null);
            }}
            company={selectedCompany}
          />
          <ManageCompanyFeaturesDialog
            open={featuresDialogOpen}
            onClose={() => {
              setFeaturesDialogOpen(false);
              setSelectedCompany(null);
            }}
            company={selectedCompany}
          />
          <Dialog
            open={viewDialogOpen}
            onClose={() => {
              setViewDialogOpen(false);
              setSelectedCompany(null);
            }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Company Details: {selectedCompany?.name}</DialogTitle>
            <DialogContent>
              <pre style={{ overflow: 'auto', fontSize: '0.85rem', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
                {JSON.stringify(selectedCompany, null, 2)}
              </pre>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setViewDialogOpen(false);
                setSelectedCompany(null);
              }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Companies;
