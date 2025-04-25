import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  Slider, 
  FormControl,
  FormLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const sectors = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consumer Goods',
  'Real Estate',
  'Energy',
  'Materials',
  'Utilities',
  'Other'
];

const investmentStages = [
  'Seed',
  'Early Stage',
  'Growth',
  'Late Stage',
  'Pre-IPO',
  'Public'
];

const ScoreCompany = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    company_name: '',
    sector: '',
    investment_stage: '',
    alignment: 5,
    team: 5,
    market: 5,
    product: 5,
    potential_return: 5,
    bold_excitement: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name) => (e, newValue) => {
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/api/score-company/', formData);
      setSuccess(true);
      // Reset form or navigate away
      setTimeout(() => {
        navigate('/scored-companies');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit scorecard. Please try again.');
      console.error('Scorecard submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    const { alignment, team, market, product, potential_return, bold_excitement } = formData;
    return ((alignment + market + product + bold_excitement) * (team + potential_return) / 80.0).toFixed(2);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Score a Company
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Company scored successfully!
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Company Info */}
            <Grid item xs={12} md={6}>
              <TextField
                name="date"
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="company_name"
                label="Company Name"
                value={formData.company_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="sector"
                label="Sector"
                value={formData.sector}
                onChange={handleChange}
                select
                fullWidth
                required
              >
                {sectors.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="investment_stage"
                label="Investment Stage"
                value={formData.investment_stage}
                onChange={handleChange}
                select
                fullWidth
                required
              >
                {investmentStages.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Scoring Sliders */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Scoring Metrics
              </Typography>
            </Grid>
            
            {Object.entries({
              alignment: 'Alignment',
              team: 'Team',
              market: 'Market',
              product: 'Product',
              potential_return: 'Potential Return',
              bold_excitement: 'Bold Excitement'
            }).map(([key, label]) => (
              <Grid item xs={12} md={6} key={key}>
                <FormControl fullWidth>
                  <FormLabel>{label}: {formData[key]}</FormLabel>
                  <Slider
                    value={formData[key]}
                    onChange={handleSliderChange(key)}
                    aria-labelledby={`${key}-slider`}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={0}
                    max={10}
                  />
                </FormControl>
              </Grid>
            ))}
            
            {/* Current Score Display */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h6" align="center">
                  Current Score: {calculateScore()}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Scorecard'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ScoreCompany;