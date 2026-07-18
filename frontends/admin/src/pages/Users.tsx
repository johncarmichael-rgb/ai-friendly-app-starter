import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Menu,
  MenuItem,
  ListItemText,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AdminService from 'apis/api-mono/services/AdminService';
import { User } from 'apis/api-mono/services/interfaces/User';
import { AdminSession } from 'apis/api-mono/services/interfaces/AdminSession';
import AssignUserToCompanyDialog from '@/components/dialogs/AssignUserToCompanyDialog';
import EditUserCompanyRoleDialog from '@/components/dialogs/EditUserCompanyRoleDialog';
import EditUserSystemRoleDialog from '@/components/dialogs/EditUserSystemRoleDialog';
import UserFilters from '@/components/users/UserFilters';
import { useCompaniesStore } from '@/store/companiesStore';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{ domains: string[]; roles: string[] }>({
    domains: [],
    roles: [],
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [systemRoleDialogOpen, setSystemRoleDialogOpen] = useState(false);
  const [systemRoleUser, setSystemRoleUser] = useState<User | null>(null);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const [roleMenuUser, setRoleMenuUser] = useState<User | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<Map<string, AdminSession[]>>(new Map());
  const [loadingSessions, setLoadingSessions] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ user: User; company: any; companyMemberId: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  const { fetchCompanies, fetchAllCompanyMembers, getUserCompanies, companyMembers } = useCompaniesStore();

  // Debounce search input — only update debouncedSearch after 300ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async (
    searchTerm: string,
    pageIndex: number,
    pageSize: number,
    domain: string | null,
    role: string | null,
  ) => {
    try {
      setLoading(true);
      const result = await AdminService.adminUsersGet({
        offset: pageIndex * pageSize,
        limit: pageSize,
        search: searchTerm || undefined,
        domain: domain || undefined,
        role: role || undefined,
      });
      setUsers((result?.data as unknown as User[]) || []);
      setTotalCount(result?.meta?.totalResultCount ?? 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convenience reload that preserves the current page/search/filters (used after mutations)
  const reload = () => fetchUsers(debouncedSearch, page, rowsPerPage, domainFilter, roleFilter);

  // Distinct domain/role filter options, fetched server-side across ALL users (not just the
  // current page) so the dropdowns offer every value that exists in the user base.
  const refreshFilterOptions = async () => {
    try {
      const options = await AdminService.adminUserFilterOptionsGet();
      setFilterOptions({ domains: options?.domains || [], roles: options?.roles || [] });
    } catch (error) {
      console.error('Failed to fetch user filter options:', error);
    }
  };

  // Fetch companies, members and filter options once on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchCompanies();
      await fetchAllCompanyMembers();
    };
    initializeData();
    refreshFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to the first page whenever the search term or a filter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, domainFilter, roleFilter]);

  // Re-fetch users whenever the search term, filters, page, or page size changes.
  // Search/domain/role filtering and pagination are all applied server-side, so the
  // results and total count span the entire user base — not just a single page.
  useEffect(() => {
    fetchUsers(debouncedSearch, page, rowsPerPage, domainFilter, roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, rowsPerPage, domainFilter, roleFilter]);

  const anyFilterActive = domainFilter !== null || roleFilter !== null;

  const handleAddCompany = (user: User) => {
    setSelectedUser(user);
    setAssignDialogOpen(true);
  };

  const handleManageRoles = (event: React.MouseEvent<HTMLElement>, user: User) => {
    const userCompanies = getUserCompanies(user._id);
    if (userCompanies.length === 0) {
      // If no companies, open add dialog instead
      handleAddCompany(user);
      return;
    }
    
    if (userCompanies.length === 1) {
      // If only one company, open edit dialog directly
      handleEditRoleForCompany(user, userCompanies[0]);
    } else {
      // If multiple companies, show menu to select which one
      setRoleMenuUser(user);
      setRoleMenuAnchor(event.currentTarget);
    }
  };

  const handleEditRoleForCompany = (user: User, company: any) => {
    const members = companyMembers.get(company._id) || [];
    const memberRecord = members.find((m: any) => {
      const memberId = m.companyMember?.userId || m.userId;
      return memberId === user._id;
    });
    const userRole = (memberRecord as any)?.companyMember?.role || (memberRecord as any)?.role || 'member';
    
    setSelectedUser(user);
    setSelectedCompany(company);
    setSelectedRole(userRole);
    setEditRoleDialogOpen(true);
    setRoleMenuAnchor(null);
    setRoleMenuUser(null);
  };

  const handleCloseRoleMenu = () => {
    setRoleMenuAnchor(null);
    setRoleMenuUser(null);
  };

  const handleToggleSessions = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);
    
    // Fetch sessions if not already loaded
    if (!userSessions.has(userId)) {
      setLoadingSessions(userId);
      try {
        const sessions = await AdminService.adminUsersUserIdSessionsGet({ userId }) as unknown as AdminSession[];
        setUserSessions(prev => new Map(prev).set(userId, sessions));
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setUserSessions(prev => new Map(prev).set(userId, []));
      } finally {
        setLoadingSessions(null);
      }
    }
  };

  const handleRemoveFromCompany = (user: User, company: any) => {
    const members = companyMembers.get(company._id) || [];
    const memberRecord = members.find((m: any) => {
      const memberId = m.companyMember?.userId || m.userId;
      return memberId === user._id;
    });
    const companyMemberId = (memberRecord as any)?.companyMember?._id || (memberRecord as any)?._id;
    if (!companyMemberId) {
      console.error('Could not find companyMemberId for user', user._id, 'in company', company._id);
      return;
    }
    setRemoveTarget({ user, company, companyMemberId });
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    try {
      setRemoving(true);
      await AdminService.adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete({
        companyId: removeTarget.company._id,
        companyMemberId: removeTarget.companyMemberId,
      });
      setRemoveDialogOpen(false);
      setRemoveTarget(null);
      reload();
      fetchAllCompanyMembers();
    } catch (error) {
      console.error('Failed to remove user from company:', error);
    } finally {
      setRemoving(false);
    }
  };

  const handleDeleteAllSessions = async (userId: string) => {
    if (!confirm('Are you sure you want to delete all sessions for this user? They will be forced to re-authenticate.')) {
      return;
    }

    try {
      await AdminService.adminUsersUserIdSessionsDelete({ userId });
      setUserSessions(prev => new Map(prev).set(userId, []));
    } catch (error) {
      console.error('Failed to delete sessions:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Users
        </Typography>
      </Box>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        domainOptions={filterOptions.domains}
        domainFilter={domainFilter}
        onDomainChange={setDomainFilter}
        roleOptions={filterOptions.roles}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        matchingCount={totalCount}
        anyFilterActive={anyFilterActive}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>System Roles</TableCell>
              <TableCell>Companies</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Sessions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {anyFilterActive || debouncedSearch
                      ? 'No users match the current filters.'
                      : 'No users found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const userCompanies = getUserCompanies(user._id);
                
                const sessions = userSessions.get(user._id) || [];
                const isExpanded = expandedUserId === user._id;
                const isLoadingSessions = loadingSessions === user._id;

                return (
                  <React.Fragment key={user._id}>
                    <TableRow hover>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        {!user.roles || user.roles.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {user.roles.map((role) => (
                              <Chip
                                key={role}
                                label={role}
                                size="small"
                                variant="filled"
                                color={role === roleFilter ? 'primary' : 'default'}
                                onClick={() => setRoleFilter(role)}
                              />
                            ))}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {userCompanies.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No companies
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {userCompanies.map((company) => {
                              // Find the user's role in this company
                              const members = companyMembers.get(company._id) || [];
                              const memberRecord = members.find((m: any) => {
                                const memberId = m.companyMember?.userId || m.userId;
                                return memberId === user._id;
                              });
                              const userRole = (memberRecord as any)?.companyMember?.role || (memberRecord as any)?.role || 'member';
                              
                              return (
                                <Chip
                                  key={company._id}
                                  label={`${company.name} (${userRole})`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onDelete={() => handleRemoveFromCompany(user, company)}
                                />
                              );
                            })}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleToggleSessions(user._id)}
                          startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          endIcon={isLoadingSessions ? <CircularProgress size={14} /> : null}
                        >
                          {isExpanded ? 'Hide' : 'View'}
                        </Button>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Add to Company">
                          <IconButton
                            size="small"
                            onClick={() => handleAddCompany(user)}
                            color="primary"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Roles">
                          <IconButton
                            size="small"
                            onClick={(e) => handleManageRoles(e, user)}
                            color="secondary"
                            disabled={userCompanies.length === 0}
                          >
                            <ManageAccountsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit System Role">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSystemRoleUser(user);
                              setSystemRoleDialogOpen(true);
                            }}
                            color={(user.roles || []).includes('SUPER_ADMIN') ? 'primary' : 'default'}
                          >
                            <AdminPanelSettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Active Sessions ({sessions.length})
                              </Typography>
                              {sessions.length > 0 && (
                                <Button
                                  size="small"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteAllSessions(user._id)}
                                >
                                  Revoke All Sessions
                                </Button>
                              )}
                            </Stack>
                            {sessions.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No active sessions
                              </Typography>
                            ) : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Last Accessed</TableCell>
                                    <TableCell>Expires</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sessions.map((session) => (
                                    <TableRow key={session._id}>
                                      <TableCell>{new Date(session.createdAt).toLocaleString()}</TableCell>
                                      <TableCell>{session.lastAccessedAt ? new Date(session.lastAccessedAt).toLocaleString() : 'Never'}</TableCell>
                                      <TableCell>{new Date(session.expiresAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100, 250]}
        />
      </TableContainer>

      <AssignUserToCompanyDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          reload();
          fetchAllCompanyMembers();
        }}
      />

      <EditUserCompanyRoleDialog
        open={editRoleDialogOpen}
        onClose={() => {
          setEditRoleDialogOpen(false);
          setSelectedUser(null);
          setSelectedCompany(null);
          setSelectedRole('');
        }}
        user={selectedUser}
        company={selectedCompany}
        currentRole={selectedRole}
        onSuccess={() => {
          reload();
          fetchAllCompanyMembers();
        }}
      />

      <EditUserSystemRoleDialog
        open={systemRoleDialogOpen}
        onClose={() => {
          setSystemRoleDialogOpen(false);
          setSystemRoleUser(null);
        }}
        user={systemRoleUser}
        onSuccess={() => {
          reload();
          refreshFilterOptions();
        }}
      />

      {/* Company selection menu for users with multiple companies */}
      <Menu
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={handleCloseRoleMenu}
      >
        {roleMenuUser && getUserCompanies(roleMenuUser._id).map((company) => {
          const members = companyMembers.get(company._id) || [];
          const memberRecord = members.find((m: any) => {
            const memberId = m.companyMember?.userId || m.userId;
            return memberId === roleMenuUser._id;
          });
          const userRole = (memberRecord as any)?.companyMember?.role || (memberRecord as any)?.role || 'member';
          
          return (
            <MenuItem
              key={company._id}
              onClick={() => handleEditRoleForCompany(roleMenuUser, company)}
            >
              <ListItemText
                primary={company.name}
                secondary={`Current role: ${userRole}`}
              />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Remove from Company confirmation dialog */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle>Remove User from Company</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{removeTarget?.user.email}</strong> from{' '}
            <strong>{removeTarget?.company?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)} disabled={removing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
