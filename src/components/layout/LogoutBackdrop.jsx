import React, { memo } from 'react';
import {
  Backdrop,
  Box,
  Typography,
  Fade,
  Slide,
} from '@mui/material';

const LogoutBackdrop = memo(({ logoutLoading, logoutSuccess }) => {
  if (!logoutLoading && !logoutSuccess) return null;

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
      open={true}
    >
      <Fade in={true} timeout={500}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            maxWidth: { xs: '90%', sm: 400 },
            textAlign: 'center',
          }}
        >
          {logoutLoading ? (
            <>
              <Box
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid #fff',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              <Slide direction="up" in={true} timeout={800}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    Logging Out
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="rgba(255,255,255,0.8)"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Please wait while we securely sign you out and clear your session...
                  </Typography>
                </Box>
              </Slide>
            </>
          ) : logoutSuccess ? (
            <>
              <Slide direction="down" in={true} timeout={600}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 70, sm: 80 },
                      height: { xs: 70, sm: 80 },
                      borderRadius: '50%',
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'successPulse 0.8s ease-in-out',
                      '@keyframes successPulse': {
                        '0%': { transform: 'scale(0.8)', opacity: 0 },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                      },
                    }}
                  >
                    <Box
                      component="svg"
                      sx={{
                        width: { xs: 35, sm: 40 },
                        height: { xs: 35, sm: 40 },
                        color: '#4caf50',
                      }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </Box>
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white', 
                      mb: 1,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    Successfully Logged Out
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="rgba(255,255,255,0.8)"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Your session has been securely terminated. Redirecting to login page...
                  </Typography>
                </Box>
              </Slide>
            </>
          ) : null}
        </Box>
      </Fade>
    </Backdrop>
  );
});

LogoutBackdrop.displayName = 'LogoutBackdrop';

export default LogoutBackdrop; 