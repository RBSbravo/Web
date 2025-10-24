import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Fade,
  Backdrop,
} from '@mui/material';

const NavigationGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthentication = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check which storage to use
      const authStorage = localStorage.getItem('auth_storage');
      const storage = authStorage === 'local' ? localStorage : sessionStorage;

      // Get user from appropriate storage
      const storedUser = storage.getItem('user');
      const token = storage.getItem('token');

      if (!storedUser || !token) {
        // Also check the other storage as fallback
        const fallbackStorage = authStorage === 'local' ? sessionStorage : localStorage;
        const fallbackUser = fallbackStorage.getItem('user');
        const fallbackToken = fallbackStorage.getItem('token');

        if (!fallbackUser || !fallbackToken) {
          // No authentication data in either storage, redirect to login
          if (location.pathname !== '/login') {
            navigate('/login', { 
              replace: true,
              state: { from: location.pathname }
            });
          }
          return;
        }
      }

      // Optionally, you can add more checks here if needed

      // Authentication successful - all department heads have access to all features
      setLoading(false);
    } catch (err) {
      setError('Authentication check failed. Please try again.');
      setLoading(false);
      
      // Redirect to login after error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Re-check authentication when storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token' || e.key === 'auth_storage') {
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthentication]);

  if (loading) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
        open={true}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CircularProgress size={60} color="primary" />
          <Typography variant="h6" color="white" textAlign="center">
            Verifying your access...
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Please wait while we check your permissions
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Fade in={true} timeout={500}>
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: 500,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
          </Alert>
        </Fade>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      {children}
    </Fade>
  );
};

export default NavigationGuard; 