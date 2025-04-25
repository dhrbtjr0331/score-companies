import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Summary = () => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: '',
    sector: '',
    startDate: null,
    endDate: null
  });

  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scorecardsRes, companiesRes, sectorsRes] = await Promise.all([
          api.get('/api/scored-companies/'),
          api.get('/api/company-names/'),
          api.get('/api/sectors/')
        ]);
        
        setScorecards(scorecardsRes.data);
        setCompanies(companiesRes.data);
        setSectors(sectorsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredScorecards = scorecards.filter(scorecard => {
    if (filters.company && scorecard.company_name !== filters.company) return false;
    if (filters.sector && scorecard.sector !== filters.sector) return false;
    if (filters.startDate && new Date(scorecard.date) < filters.startDate) return false;
    if (filters.endDate && new Date(scorecard.date) > filters.endDate) return false;
    return true;
  });

  // Prepare data for charts
  const scoreByCompany = companies.map(company => {
    const companyCards = filteredScorecards.filter(sc => sc.company_name === company);
    const avgScore = companyCards.length 
      ? companyCards.reduce((acc, curr) => acc + curr.score, 0) / companyCards.length
      : 0;
    return {
      company,
      score: parseFloat(avgScore.toFixed(2)),
      count: companyCards.length
    };
  }).filter(item => item.count > 0);

  const scoreBySector = sectors.map(sector => {
    const sectorCards = filteredScorecards.filter(sc => sc.sector === sector);
    const avgScore = sectorCards.length
      ? sectorCards.reduce((acc, curr) => acc + curr.score, 0) / sectorCards.length
      : 0;
    return {
      sector,
      score: parseFloat(avgScore.toFixed(2)),
      count: sectorCards.length
    };
  }).filter(item => item.count > 0);

  const scoreOverTime = filteredScorecards
    .map(sc => ({ date: sc.date, score: sc.score }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const scoreDistribution = (() => {
    const ranges = [
      { range: '0-2', min: 0, max: 2, count: 0 },
      { range: '2-4', min: 2, max: 4, count: 0 },
      { range: '4-6', min: 4, max: 6, count: 0 },
      { range: '6-8', min: 6, max: 8, count: 0 },
      { range: '8-10', min: 8, max: 10, count: 0 }
    ];

    filteredScorecards.forEach(sc => {
      for (let range of ranges) {
        if (sc.score >= range.min && sc.score < range.max) {
          range.count++;
          break;
        }
      }
    });

    return ranges;
  })();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Summary & Analytics
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Company</InputLabel>
              <Select
                value={filters.company}
                label="Company"
                onChange={(e) => handleFilterChange('company', e.target.value)}
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map(company => (
                  <MenuItem key={company} value={company}>{company}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sector</InputLabel>
              <Select
                value={filters.sector}
                label="Sector"
                onChange={(e) => handleFilterChange('sector', e.target.value)}
              >
                <MenuItem value="">All Sectors</MenuItem>
                {sectors.map(sector => (
                  <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Scorecards</Typography>
            <Typography variant="h4">{filteredScorecards.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Average Score</Typography>
            <Typography variant="h4">
              {filteredScorecards.length 
                ? (filteredScorecards.reduce((acc, curr) => acc + curr.score, 0) / filteredScorecards.length).toFixed(2)
                : 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Companies Scored</Typography>
            <Typography variant="h4">{scoreByCompany.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Sectors Covered</Typography>
            <Typography variant="h4">{scoreBySector.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Average Score by Company</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={scoreByCompany}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Score Distribution by Sector</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={scoreBySector}
                  dataKey="count"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ sector, count }) => `${sector} (${count})`}
                >
                  {scoreBySector.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Score Trend Over Time</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={scoreOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Score Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Summary;