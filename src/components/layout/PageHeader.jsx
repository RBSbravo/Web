import React from 'react';
import { Box, Typography, Paper, Button, useTheme } from '@mui/material';

const PageHeader = ({ 
  title, 
  subtitle, 
  emoji, 
  color = 'primary',
  actionButton,
  children 
}) => {
  const theme = useTheme();

  const getGradientColors = (colorName) => {
    switch (colorName) {
      case 'primary':
        return [theme.palette.primary.main, theme.palette.primary.dark];
      case 'secondary':
        return [theme.palette.secondary.main, theme.palette.secondary.dark];
      case 'info':
        return [theme.palette.info.main, theme.palette.info.dark];
      case 'success':
        return [theme.palette.success.main, theme.palette.success.dark];
      case 'warning':
        return [theme.palette.warning.main, theme.palette.warning.dark];
      case 'error':
        return [theme.palette.error.main, theme.palette.error.dark];
      default:
        return [theme.palette.primary.main, theme.palette.primary.dark];
    }
  };

  const [startColor, endColor] = getGradientColors(color);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3, md: 4 },
        mt: { xs: 1, sm: 2 },
        background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
        color: 'white',
        borderRadius: 3
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {title} {emoji}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 400 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {actionButton && (
            <Button
              variant="contained"
              startIcon={actionButton.icon}
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              sx={{ 
                backgroundColor: 'white',
                color: startColor,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.92)' }
              }}
            >
              {actionButton.text}
            </Button>
          )}
          {children}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;


