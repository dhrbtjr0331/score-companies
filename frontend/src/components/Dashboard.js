import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent,
  CardActions
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  List as ListIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    sectors: [],
    recentScores: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companiesRes, sectorsRes] = await Promise.all([
          api.get('/api/company-names/'),
          api.get('/api/sectors/')
        ]);
        
        setStats({
          totalCompanies: companiesRes.data.length,
          sectors: sectorsRes.data,
          recentScores: []
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const actionCards = [
    {
      title: 'Summary',
      description: 'View analytics and visualizations of all scored companies.',
      icon: <BarChartIcon fontSize="large" color="primary" />,
      action: () => navigate('/summary')
    },
    {
      title: 'Score a Company',
      description: 'Evaluate a new company using the investment scorecard.',
      icon: <AddIcon fontSize="large" color="primary" />,
      action: () => navigate('/score-company')
    },
    {
      title: 'View Scored Companies',
      description: 'See all previously scored companies and their evaluations.',
      icon: <ListIcon fontSize="large" color="primary" />,
      action: () => navigate('/scored-companies')
    }
  ];

  if (loading || authLoading) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome back, {currentUser?.firstName || currentUser?.first_name || 'User'}!
        </Typography>
        <Typography variant="body1">
          Use the scorecard app to evaluate investment opportunities and track your assessments.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* All Cards including Summary */}
        {actionCards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={card.action}>
                  Go to {card.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;