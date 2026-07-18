import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useEffect } from 'react';
import { useCompaniesStore } from '@/store/companiesStore';

const Dashboard = () => {
  const { companies, fetchCompanies } = useCompaniesStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const stats = [
    {
      title: 'Total Companies',
      value: companies.length,
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'With Verified Domains',
      value: companies.filter((c) => (c.domains || []).length > 0).length,
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
    {
      title: 'With Feature Codes',
      value: companies.filter((c) => (c.featureCodes || []).length > 0).length,
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {stat.icon}
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Welcome to the Admin Console
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the administrative console for managing tenants, users, features and permissions.
          Use the sidebar to navigate between different sections.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
