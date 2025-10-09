import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DebugInfo = () => {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  const userAgent = navigator.userAgent;
  
  return (
    <Paper sx={{ p: 2, m: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        Debug Information
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Current URL:</strong> {currentUrl}
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Current Path:</strong> {currentPath}
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>User Agent:</strong> {userAgent}
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Timestamp:</strong> {new Date().toISOString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DebugInfo;
