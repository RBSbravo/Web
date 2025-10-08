import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Collapse,
  useTheme,
  Typography,
  Grid
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const ReportFilters = ({
  showFilters,
  setShowFilters,
  filterType,
  setFilterType,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate
}) => {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const hasActiveFilters = filterType !== 'all' || filterStartDate || filterEndDate;

  return (
    <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: showFilters ? `1px solid ${theme.palette.divider}` : 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ color: theme.palette.primary.main }} />
          <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Filters
            {hasActiveFilters && (
              <Box component="span" sx={{ 
                ml: 1, 
                px: 1, 
                py: 0.25, 
                bgcolor: theme.palette.primary.main, 
                color: 'white', 
                borderRadius: 1, 
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                Active
              </Box>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasActiveFilters && (
            <IconButton
              size="small"
              onClick={handleClearFilters}
              sx={{ 
                color: theme.palette.error.main,
                '&:hover': { bgcolor: theme.palette.error.light }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.light }
            }}
          >
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Box sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={filterType}
                  label="Report Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="ticket">Ticket Reports</MenuItem>
                  <MenuItem value="task">Task Reports</MenuItem>
                  <MenuItem value="user">User Reports</MenuItem>
                  <MenuItem value="department">Department Reports</MenuItem>
                  <MenuItem value="custom">Custom Reports</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ReportFilters;
