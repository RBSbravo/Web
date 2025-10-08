import React, { memo } from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = memo(() => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    backgroundColor: 'background.default'
  }}>
    <CircularProgress size={60} />
  </Box>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner; 