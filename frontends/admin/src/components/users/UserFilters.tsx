import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface UserFiltersProps {
  /** Search text (debounced upstream and sent to the server) */
  search: string;
  onSearchChange: (value: string) => void;
  /** Domain options fetched server-side across all users */
  domainOptions: string[];
  domainFilter: string | null;
  onDomainChange: (value: string | null) => void;
  /** System-role options fetched server-side across all users */
  roleOptions: string[];
  roleFilter: string | null;
  onRoleChange: (value: string | null) => void;
  /** Total users matching the active filters across the whole user base (all pages) */
  matchingCount: number;
  /** Whether at least one of domain/role is set */
  anyFilterActive: boolean;
}

const UserFilters = ({
  search,
  onSearchChange,
  domainOptions,
  domainFilter,
  onDomainChange,
  roleOptions,
  roleFilter,
  onRoleChange,
  matchingCount,
  anyFilterActive,
}: UserFiltersProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search users by email or name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Autocomplete
          options={domainOptions}
          value={domainFilter}
          onChange={(_, value) => onDomainChange(value)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Filter by domain" />
          )}
          size="small"
          clearOnEscape
        />
        <Autocomplete
          options={roleOptions}
          value={roleFilter}
          onChange={(_, value) => onRoleChange(value)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Filter by system role" />
          )}
          size="small"
          clearOnEscape
        />
      </Box>
      {anyFilterActive && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {matchingCount} {matchingCount === 1 ? 'user matches' : 'users match'} the active filters.
        </Typography>
      )}
    </Box>
  );
};

export default UserFilters;
