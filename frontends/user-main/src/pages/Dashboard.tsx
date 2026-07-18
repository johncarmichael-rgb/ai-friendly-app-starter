import { useState } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import HealthService from 'apis/api-mono/services/HealthService';
import { useUserStore } from '@/store/userStore';

const Dashboard = () => {
  const { currentUser } = useUserStore();

  const [healthResponse, setHealthResponse] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const displayName =
    currentUser?.displayName || `${currentUser?.firstName} ${currentUser?.lastName}`;

  const handleCallHealth = async () => {
    setHealthLoading(true);
    setHealthResponse(null);
    setHealthError(null);
    try {
      const response = await HealthService.healthGet();
      setHealthResponse(JSON.stringify(response, null, 2));
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : 'Health check failed');
      console.error('Error calling health endpoint:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to the dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        You are logged in as {displayName}
      </Typography>

      <Button variant="contained" onClick={handleCallHealth} disabled={healthLoading}>
        Call API health
      </Button>

      {healthResponse && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Response
          </Typography>
          <Box component="pre" sx={{ m: 0, overflowX: 'auto' }}>
            {healthResponse}
          </Box>
        </Paper>
      )}

      {healthError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {healthError}
        </Alert>
      )}
    </Box>
  );
};

export default Dashboard;
