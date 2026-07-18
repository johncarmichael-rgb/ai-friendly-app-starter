import { useEffect, useState, useRef } from 'react';
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
  IconButton,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Checkbox,
  Toolbar,
  Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableSortLabel from '@mui/material/TableSortLabel';
import { usePermissionsStore } from '@/store/permissionsStore';
import { Permission } from 'apis/api-mono/services/interfaces/Permission';
import CreatePermissionDialog from '@/components/dialogs/CreatePermissionDialog';
import EditPermissionDialog from '@/components/dialogs/EditPermissionDialog';
import DeletePermissionDialog from '@/components/dialogs/DeletePermissionDialog';
import BulkAssignGroupDialog from '@/components/dialogs/BulkAssignGroupDialog';
import RenameGroupDialog from '@/components/dialogs/RenameGroupDialog';

const Permissions = () => {
  const { permissions, loading, fetchPermissions } = usePermissionsStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isToolbarFixed, setIsToolbarFixed] = useState(false);
  const [renameGroupDialogOpen, setRenameGroupDialogOpen] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [sortField, setSortField] = useState<'code' | 'name' | 'group'>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarPlaceholderRef = useRef<HTMLDivElement>(null);

  const handleRenameGroup = (groupName: string) => {
    setSelectedGroupName(groupName);
    setRenameGroupDialogOpen(true);
  };

  // Track scroll position to fix toolbar when it would scroll out of view
  useEffect(() => {
    const handleScroll = () => {
      if (toolbarPlaceholderRef.current && selectedIds.length > 0) {
        const rect = toolbarPlaceholderRef.current.getBoundingClientRect();
        // Fix when the placeholder scrolls above the navbar (64px)
        setIsToolbarFixed(rect.top < 64);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedIds.length]);

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setEditDialogOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };


  const handleSelectAll = (permissionIds: string[]) => {
    const allSelected = permissionIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !permissionIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...permissionIds])]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setLastClickedId(null);
  };

  // Extract the last word (verb) from a camelCase code like "apiCompanyCreate" -> "Create"
  const extractVerb = (code: string): string => {
    const match = code.match(/[A-Z][a-z]*$/);
    return match ? match[0] : '';
  };

  // Handle sort column click
  const handleSort = (field: 'code' | 'name' | 'group') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.group && p.group.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort permissions for flat view
  const sortedFlatPermissions = [...filteredPermissions].sort((a, b) => {
    let aVal: string;
    let bVal: string;
    
    switch (sortField) {
      case 'code':
        aVal = a.code;
        bVal = b.code;
        break;
      case 'name':
        aVal = a.name;
        bVal = b.name;
        break;
      case 'group':
        aVal = a.group || '';
        bVal = b.group || '';
        break;
      default:
        aVal = a.code;
        bVal = b.code;
    }
    
    const comparison = aVal.localeCompare(bVal);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Separate custom and API permissions
  const apiPermissions = filteredPermissions.filter((p) => !p.isCustom);
  const customPermissions = filteredPermissions.filter((p) => p.isCustom);

  // Group permissions by group name
  const groupedApiPermissions = apiPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const group = p.group || 'Ungrouped';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  // Sort groups alphabetically, but put "Ungrouped" last
  const sortedGroups = Object.keys(groupedApiPermissions).sort((a, b) => {
    if (a === 'Ungrouped') return 1;
    if (b === 'Ungrouped') return -1;
    return a.localeCompare(b);
  });

  // Get flat list of all permission IDs in display order for shift-click range selection
  const getAllPermissionIdsInOrder = (): string[] => {
    const ids: string[] = [];
    // Custom permissions first
    customPermissions.forEach((p) => ids.push(p._id));
    // Then API permissions by group
    sortedGroups.forEach((groupName) => {
      groupedApiPermissions[groupName].forEach((p) => ids.push(p._id));
    });
    return ids;
  };

  const handleSelectPermission = (id: string, event?: React.MouseEvent) => {
    const isShiftClick = event?.shiftKey;

    if (isShiftClick && lastClickedId && lastClickedId !== id) {
      // Shift-click: select range between lastClickedId and current id
      const allIds = getAllPermissionIdsInOrder();
      const lastIndex = allIds.indexOf(lastClickedId);
      const currentIndex = allIds.indexOf(id);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = allIds.slice(start, end + 1);

        setSelectedIds((prev) => [...new Set([...prev, ...rangeIds])]);
      }
    } else {
      // Normal click: toggle single selection
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }

    setLastClickedId(id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage API and custom permissions for role-based access control
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Custom Permission
        </Button>
      </Box>

      {/* Selection Toolbar or Search */}
      {selectedIds.length > 0 ? (
        <>
          {/* Placeholder to maintain layout space when toolbar is fixed */}
          <Box ref={toolbarPlaceholderRef} sx={{ height: isToolbarFixed ? 64 : 0, mb: isToolbarFixed ? 3 : 0 }} />
          <Toolbar
            ref={toolbarRef}
            sx={{
              mb: isToolbarFixed ? 0 : 3,
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              bgcolor: (theme) => theme.palette.primary.light,
              color: (theme) => theme.palette.primary.contrastText,
              borderRadius: isToolbarFixed ? 0 : 1,
              position: isToolbarFixed ? 'fixed' : 'relative',
              top: isToolbarFixed ? 64 : 'auto', // Below the navbar (64px)
              left: isToolbarFixed ? 0 : 'auto',
              right: isToolbarFixed ? 0 : 'auto',
              zIndex: 1100,
              boxShadow: isToolbarFixed ? 4 : 2,
            }}
          >
            <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
              {selectedIds.length} selected
            </Typography>
            <Button
              variant="contained"
              startIcon={<FolderIcon />}
              onClick={() => setBulkAssignDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Assign Group
            </Button>
            <Button variant="outlined" onClick={handleClearSelection} sx={{ color: 'inherit', borderColor: 'inherit' }}>
              Clear Selection
            </Button>
          </Toolbar>
        </>
      ) : (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant={viewMode === 'flat' ? 'contained' : 'outlined'}
            size="small"
            startIcon={viewMode === 'flat' ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped')}
          >
            {viewMode === 'flat' ? 'Grouped View' : 'Flat List'}
          </Button>
        </Box>
      )}

      {/* Flat View - All Permissions in One Table */}
      {viewMode === 'flat' && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            All Permissions ({sortedFlatPermissions.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click column headers to sort. Custom permissions are marked with a badge.
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : sortedFlatPermissions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'No permissions match your search' : 'No permissions found'}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          sortedFlatPermissions.some((p) => selectedIds.includes(p._id)) &&
                          !sortedFlatPermissions.every((p) => selectedIds.includes(p._id))
                        }
                        checked={sortedFlatPermissions.length > 0 && sortedFlatPermissions.every((p) => selectedIds.includes(p._id))}
                        onChange={() => handleSelectAll(sortedFlatPermissions.map((p) => p._id))}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'code'}
                        direction={sortField === 'code' ? sortDirection : 'asc'}
                        onClick={() => handleSort('code')}
                      >
                        Code
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'name'}
                        direction={sortField === 'name' ? sortDirection : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'group'}
                        direction={sortField === 'group' ? sortDirection : 'asc'}
                        onClick={() => handleSort('group')}
                      >
                        Group
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedFlatPermissions.map((permission) => (
                    <TableRow
                      key={permission._id}
                      hover
                      selected={selectedIds.includes(permission._id)}
                      onClick={(e) => handleSelectPermission(permission._id, e)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(permission._id)}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPermission(permission._id, e);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            backgroundColor: 'action.hover',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontSize: '0.75rem',
                          }}
                        >
                          {permission.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {permission.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {permission.group ? (
                          <Chip label={permission.group} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={permission.isCustom ? 'Custom' : 'API'}
                          size="small"
                          color={permission.isCustom ? 'secondary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(permission);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {permission.isCustom && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(permission);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Grouped View - Custom Permissions Section */}
      {viewMode === 'grouped' && customPermissions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Custom Permissions ({customPermissions.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        customPermissions.some((p) => selectedIds.includes(p._id)) &&
                        !customPermissions.every((p) => selectedIds.includes(p._id))
                      }
                      checked={customPermissions.every((p) => selectedIds.includes(p._id))}
                      onChange={() => handleSelectAll(customPermissions.map((p) => p._id))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customPermissions.map((permission) => (
                  <TableRow
                    key={permission._id}
                    hover
                    selected={selectedIds.includes(permission._id)}
                    onClick={(e) => handleSelectPermission(permission._id, e)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(permission._id)}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPermission(permission._id, e);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          backgroundColor: 'action.hover',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          fontSize: '0.75rem',
                        }}
                      >
                        {permission.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {permission.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {permission.group ? (
                        <Chip label={permission.group} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(permission);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(permission);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Grouped View - API Permissions Section */}
      {viewMode === 'grouped' && (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            API Permissions ({apiPermissions.length})
          </Typography>
          {sortedGroups.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={collapsedGroups.size === sortedGroups.length ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              onClick={() => {
                if (collapsedGroups.size === sortedGroups.length) {
                  // All collapsed, expand all
                  setCollapsedGroups(new Set());
                } else {
                  // Collapse all
                  setCollapsedGroups(new Set(sortedGroups));
                }
              }}
            >
              {collapsedGroups.size === sortedGroups.length ? 'Expand All' : 'Collapse All'}
            </Button>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These permissions are derived from the OpenAPI specification. You can edit the display name
          and group but cannot delete them.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : apiPermissions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No permissions match your search' : 'No API permissions found'}
            </Typography>
          </Paper>
        ) : (
          sortedGroups.map((groupName) => {
            const groupPermissionIds = groupedApiPermissions[groupName].map((p) => p._id);
            const allGroupSelected = groupPermissionIds.every((id) => selectedIds.includes(id));
            const someGroupSelected = groupPermissionIds.some((id) => selectedIds.includes(id));

            const isCollapsed = collapsedGroups.has(groupName);

            return (
              <Box key={groupName} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => toggleGroupCollapse(groupName)}
                  >
                    {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                  </IconButton>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: groupName === 'Ungrouped' ? 'text.secondary' : 'text.primary',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                    onClick={() => toggleGroupCollapse(groupName)}
                  >
                    {groupName} ({groupedApiPermissions[groupName].length})
                  </Typography>
                  {groupName !== 'Ungrouped' && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameGroup(groupName);
                      }}
                      sx={{ ml: 1 }}
                      title="Rename group"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Collapse in={!isCollapsed}>
                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={someGroupSelected && !allGroupSelected}
                              checked={allGroupSelected}
                              onChange={() => handleSelectAll(groupPermissionIds)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell width={80}>Verb</TableCell>
                          <TableCell>Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Group</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                    <TableBody>
                      {groupedApiPermissions[groupName].map((permission) => (
                        <TableRow
                          key={permission._id}
                          hover
                          selected={selectedIds.includes(permission._id)}
                          onClick={(e) => handleSelectPermission(permission._id, e)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedIds.includes(permission._id)}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPermission(permission._id, e);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={extractVerb(permission.code)}
                              size="small"
                              variant="outlined"
                              color={
                                extractVerb(permission.code) === 'Create'
                                  ? 'success'
                                  : extractVerb(permission.code) === 'Delete'
                                    ? 'error'
                                    : extractVerb(permission.code) === 'Update'
                                      ? 'warning'
                                      : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                backgroundColor: 'action.hover',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                fontSize: '0.75rem',
                              }}
                            >
                              {permission.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {permission.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {permission.group ? (
                              <Chip label={permission.group} size="small" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(permission);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </TableContainer>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
      )}

      {/* Dialogs */}
      <CreatePermissionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {selectedPermission && (
        <>
          <EditPermissionDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedPermission(null);
            }}
            permission={selectedPermission}
          />
          <DeletePermissionDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedPermission(null);
            }}
            permission={selectedPermission}
          />
        </>
      )}

      <BulkAssignGroupDialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        selectedIds={selectedIds}
        onComplete={handleClearSelection}
      />

      {selectedGroupName && (
        <RenameGroupDialog
          open={renameGroupDialogOpen}
          onClose={() => {
            setRenameGroupDialogOpen(false);
            setSelectedGroupName(null);
          }}
          currentGroupName={selectedGroupName}
          permissionCount={(groupedApiPermissions[selectedGroupName] || []).length}
          existingGroups={sortedGroups}
        />
      )}
    </Box>
  );
};

export default Permissions;
