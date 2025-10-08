import React, { memo, useCallback } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Divider,
  Chip,
  Box,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  AccountCircle,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import useTheme from '../../context/useTheme';
import mitoLogo from '../../assets/mito_logo.png';

const AppBar = memo(({ 
  onSidebarToggle, 
  user, 
  anchorEl, 
  onMenuOpen, 
  onMenuClose, 
  onLogout, 
  onNotificationClick,
  onNavigate,
  unreadCount = 0
}) => {
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = useCallback(() => {
    onMenuClose();
    onLogout();
  }, [onMenuClose, onLogout]);

  const handleNavigation = useCallback((path) => {
    onMenuClose();
    onNavigate(path);
  }, [onMenuClose, onNavigate]);

  const handleNotificationClick = useCallback(() => {
    onNotificationClick();
  }, [onNotificationClick]);

  const userInitial = user?.firstname ? user.firstname[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'U');

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 }
      }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ 
            mr: { xs: 1.5, sm: 2 },
            display: { sm: 'none' },
            borderRadius: 2,
            transition: 'background 0.2s',
            '&:hover, &:focus': {
              backgroundColor: 'rgba(46,125,50,0.08)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Logo and Title */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexGrow: 1,
          minWidth: 0,
          gap: { xs: 1, sm: 2 }
        }}>
          <Box
            component="img"
            src={mitoLogo}
            alt="Mito Logo"
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: '50%',
              objectFit: 'cover',
              mr: { xs: 1, sm: 2 },
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '2px solid',
              borderColor: 'primary.main',
              backgroundColor: 'background.paper',
            }}
          />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.35rem' },
              display: { xs: 'none', sm: 'block' },
              letterSpacing: 0.5
            }}
          >
            Ticketing and Task Management System
          </Typography>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.1rem',
              display: { xs: 'block', sm: 'none' },
              letterSpacing: 0.5
            }}
          >
            TMS
          </Typography>
        </Box>

        {/* Department Info - Responsive */}
        <Chip
          icon={<BusinessIcon />}
          label={user?.department || 'Department'}
          color="primary"
          variant="outlined"
          sx={{ 
            mr: { xs: 1, sm: 2 },
            display: { xs: 'none', md: 'flex' },
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            borderRadius: 2,
            fontWeight: 500
          }}
        />

        <IconButton 
          color="inherit" 
          onClick={toggleTheme} 
          sx={{ 
            mr: { xs: 0.5, sm: 1 },
            p: { xs: 0.5, sm: 1 },
            borderRadius: 2,
            transition: 'background 0.2s',
            '&:hover, &:focus': {
              backgroundColor: 'rgba(46,125,50,0.08)',
            },
          }}
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <Tooltip title="Notifications">
          <IconButton 
            color="inherit" 
            onClick={handleNotificationClick}
            sx={{ 
              mr: { xs: 0.5, sm: 1 },
              p: { xs: 0.5, sm: 1 },
              borderRadius: 2,
              transition: 'background 0.2s',
              '&:hover, &:focus': {
                backgroundColor: 'rgba(46,125,50,0.08)',
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account settings">
          <IconButton
            onClick={onMenuOpen}
            size="small"
            sx={{ 
              ml: { xs: 0.5, sm: 2 },
              p: { xs: 0.5, sm: 1 },
              borderRadius: 2,
              transition: 'background 0.2s',
              '&:hover, &:focus': {
                backgroundColor: 'rgba(46,125,50,0.08)',
              },
            }}
            aria-controls={anchorEl ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
          >
            <Avatar sx={{ 
              width: { xs: 32, sm: 36 }, 
              height: { xs: 32, sm: 36 }, 
              bgcolor: muiTheme.palette.primary.main,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 600,
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
              {userInitial}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* User Menu */}
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        disablePortal={false}
        disableScrollLock={false}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              minWidth: { xs: 200, sm: 220 },
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.common.white,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              '& .MuiMenuItem-root': {
                fontSize: { xs: 14, sm: 16 },
                fontWeight: 500,
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1, sm: 1.5 },
                borderRadius: 1,
                transition: 'background 0.2s',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(76,175,80,0.08)'
                      : 'rgba(56,142,60,0.08)',
                },
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </MuiAppBar>
  );
});

AppBar.displayName = 'AppBar';

export default AppBar; 