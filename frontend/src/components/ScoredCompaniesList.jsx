import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import api from '../services/api';

const ScoredCompaniesList = () => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchScorecards = async () => {
      try {
        const response = await api.get('/api/scored-companies/');
        setScorecards(response.data);
      } catch (error) {
        console.error('Failed to fetch scorecards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScorecards();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredScorecards = scorecards.filter(scorecard => 
    scorecard.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scorecard.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'primary';
    if (score >= 4) return 'warning';
    return 'error';
  };

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
        Scored Companies
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by company name or sector..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell>Investment Stage</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell>Scored By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredScorecards
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((scorecard) => (
                  <TableRow key={scorecard.id} hover>
                    <TableCell>{scorecard.date}</TableCell>
                    <TableCell>{scorecard.company_name}</TableCell>
                    <TableCell>{scorecard.sector}</TableCell>
                    <TableCell>{scorecard.investment_stage}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={scorecard.score.toFixed(2)} 
                        color={getScoreColor(scorecard.score)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {scorecard.scored_by ? 
                        `${scorecard.scored_by.first_name} ${scorecard.scored_by.last_name}` : 
                        'Unknown'}
                    </TableCell>
                  </TableRow>
                ))}
              {filteredScorecards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No scored companies found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredScorecards.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ScoredCompaniesList;