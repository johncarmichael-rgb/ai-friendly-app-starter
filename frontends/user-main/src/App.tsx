import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import { useUserStore } from '@/store/userStore';
import config from '@/config';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  const { currentUser, loading, error, fetchCurrentUser } = useUserStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleLogin = () => {
    window.location.href = config.api.baseApiUrl + '/api/auth/login';
  };

  // While the current user is being fetched show a centered spinner
  if (loading || (!currentUser && !error)) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not logged in (e.g. 401 - the HttpService 401 interceptor may have
  // already cleared the session) - show a log in screen
  if (!currentUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <Typography variant="h5">You are not logged in</Typography>
        <Button variant="contained" onClick={handleLogin}>
          Log in
        </Button>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

export default App;
